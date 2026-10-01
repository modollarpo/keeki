import {loadMediaItemTracks} from '@app/web-player/requests/load-media-item-tracks';
import {
  playbackAuthGateState,
  shouldGatePlayback,
} from '@app/web-player/auth/playback-auth-gate-store';
import {playerOverlayState} from '@app/web-player/state/player-overlay-store';
import {findAudiusStream} from '@app/web-player/tracks/requests/find-audius-stream';
import {findJamendoStream} from '@app/web-player/tracks/requests/find-jamendo-stream';
import {findYoutubeDirectStream} from '@app/web-player/tracks/requests/find-youtube-direct-stream';
import {findYoutubeVideosForTrack, prefetchYoutubeVideoIds} from '@app/web-player/tracks/requests/find-youtube-videos-for-track';
import {Track} from '@app/web-player/tracks/track';
import {tracksToMediaItems} from '@app/web-player/tracks/utils/track-to-media-item';
import {apiClient} from '@common/http/query-client';
import {
  HtmlAudioMediaItem,
  MediaItem,
  YoutubeMediaItem,
} from '@common/player/media-item';
import {
  YouTubePlayerState,
  YoutubeProviderError,
  YoutubeProviderInternalApi,
} from '@common/player/providers/youtube/youtube-types';
import {PlayerStoreOptions} from '@common/player/state/player-store-options';
import type {PlayerState} from '@common/player/state/player-state';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

// used to track play history for logging plays on backend (prevents logging play twice, unless track is fully played)
const trackPlays = new Set<number>();

// this is needed in order to stop YouTube embed from trying to
// cue a video that will error out while valid video is already playing
const failedVideoId = ' ';

// list of video Ids for which YouTube embed errored out
const failedVideoIds = new Set<string>();
let tracksSkippedDueToError = 0;

// keys of direct-stream fallback attempts (trackId:videoId), prevents
// retrying the same failed direct stream endlessly
const directStreamGuards = new Set<string>();

// ids of media items that are currently cued as a direct html audio stream,
// used to detect failures of the fallback provider and skip the track
const directStreamCuedIds = new Set<string>();

async function resolveYoutubeSrc(
  media: YoutubeMediaItem<Track>,
): Promise<YoutubeMediaItem> {
  const results = await findYoutubeVideosForTrack(media.meta!);
  // Find first video ID that did not error out yet
  const match = results?.find(r => !failedVideoIds.has(`${r.id}`))?.id;
  return {
    ...media,
    src: match || failedVideoId,
  };
}

// last resort fallback: resolve a directly playable audio url for a video
// whose embed errored out and play it via the html audio provider. This
// bypasses embeds/sign-in requirements entirely.
async function cueDirectStreamFallback(
  media: MediaItem<Track>,
  videoId: string,
  cue: PlayerState['cue'],
  play: PlayerState['play'],
): Promise<'playing' | 'skipped' | 'handled'> {
  if (!videoId) return 'skipped';
  const guardKey = `${media.id}:${videoId}`;
  if (directStreamGuards.has(guardKey)) return 'skipped';
  directStreamGuards.add(guardKey);

  let url = videoId && videoId !== failedVideoId ? await findYoutubeDirectStream(videoId) : null;

  // Multi-source fallback: search Audius and Jamendo in parallel, take the
  // first one that returns a URL to avoid sequential round-trip delays.
  if (!url && media.meta) {
    const query = `${media.meta.artists?.[0]?.name || ''} ${media.meta.name || ''}`.trim();
    if (query) {
      url = await Promise.any([
        findAudiusStream(query).then(u => { if (!u) throw new Error('no url'); return u; }),
        findJamendoStream(query).then(u => { if (!u) throw new Error('no url'); return u; }),
      ]).catch(() => null);
    }
  }

  if (!url) return 'skipped';

  // keep same id as cued media, so queue pointer (player-queue.ts) still
  // resolves the current track for playNext/playPrevious. Change groupId
  // instead, so cue() doesn't bail out early via isSameMedia().
  const directStreamMedia: HtmlAudioMediaItem<Track> = {
    ...media,
    provider: 'htmlAudio',
    src: url,
    groupId: `${media.groupId}:direct`,
  };

  directStreamCuedIds.add(`${media.id}`);

  try {
    await cue(directStreamMedia);
    await play();
    // stream is viable, forget the guard so a future error on this
    // track+video can re-use the same working direct stream
    directStreamGuards.delete(guardKey);
    return 'playing';
  } catch (err) {
    // if the html audio errored out, its own "error" event already fired
    // the htmlAudio branch of our error listener, which removed the id from
    // the set and skipped the track. Only count this as "skipped" if that
    // branch did not run yet (eg. play() was rejected by autoplay policy).
    if (directStreamCuedIds.has(`${media.id}`)) {
      directStreamCuedIds.delete(`${media.id}`);
      return 'skipped';
    }
    return 'handled';
  }
}

function setMediaSessionMetadata(media: MediaItem<Track>) {
  if ('mediaSession' in navigator) {
    const track = media.meta;
    if (!track) return;
    const image = track.image || track.album?.image;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.artists?.[0]?.name,
      album: track.album?.name,
      artwork: image
        ? [
            {
              src: image,
              sizes: '300x300',
              type: 'image/jpg',
            },
          ]
        : undefined,
    });
  }
}

export const playerStoreOptions: Partial<PlayerStoreOptions> = {
  persistQueueInLocalStorage: true,
  defaultVolume: getBootstrapData().settings.player?.default_volume,
  setMediaSessionMetadata,
  youtube: {
    srcResolver: resolveYoutubeSrc,
    onStateChange: state => {
      if (state === YouTubePlayerState.Playing) {
        tracksSkippedDueToError = 0;
      }
    },
  },
  onBeforePlay: () => {
    // don't open the fullscreen overlay for guests who are about to see the
    // sign-in dialog; the "play" listener below handles gating.
    if (shouldGatePlayback()) return;
    const player = getBootstrapData().settings.player;
    // on mobile, YouTube embed playback needs to be started via user gesture
    // on YouTube embed itself, starting it with custom play button will not work
    if (
      player?.mobile?.auto_open_overlay &&
      // check if mobile
      window.matchMedia('(max-width: 768px)').matches
    ) {
      playerOverlayState.open();
      // wait for overlay animation to complete
      return new Promise<void>(resolve => setTimeout(() => resolve(), 151));
    }
  },
  loadMoreMediaItems: async media => {
    const groupId = media?.groupId?.toString();
    if (media && groupId && !groupId.includes('libraryDownloadedTracks')) {
      const tracks = await loadMediaItemTracks(groupId, media.meta);
      return await tracksToMediaItems(tracks);
    }
  },
  listeners: {
    // change document title to currently cued track name and prefetch upcoming tracks
    cued: ({state: {cuedMedia, shuffledQueue}}) => {
      if (!cuedMedia) return;
      const site_name = getBootstrapData().settings.branding.site_name;
      let title = `${cuedMedia.meta.name}`;
      const artistName = cuedMedia.meta.artists?.[0]?.name;

      if (artistName) {
        title = `${title} - ${artistName} - ${site_name}`;
      } else {
        title = `${title} - ${site_name}`;
      }

      document.title = title;

      // Look-ahead: prefetch YouTube video IDs for the next 3 tracks in the
      // queue that still need resolving, so they're ready before the user
      // reaches them (eliminates the wait when switching tracks).
      const currentIndex = shuffledQueue.findIndex(m => m.id === cuedMedia.id);
      if (currentIndex !== -1) {
        const upcoming = shuffledQueue
          .slice(currentIndex + 1, currentIndex + 4)
          .filter(m => m.provider === 'youtube' && m.src === 'resolve' && m.meta)
          .map(m => m.meta as Track);
        if (upcoming.length) {
          prefetchYoutubeVideoIds(upcoming);
        }
      }
    },
    play: ({state: {cuedMedia, pause, play}}) => {
      // signed-out visitors must register or sign in before playback starts;
      // keep the track cued so it can resume after a successful auth.
      if (shouldGatePlayback()) {
        pause();
        playbackAuthGateState.open({
          trackName: cuedMedia?.meta?.name ?? null,
          resume: () => void play(),
        });
        return;
      }
      // prevent playback if user does not have permission to play music
      const hasPermission = userHasPlayPermission();
      if (!hasPermission) {
        toast.error(
          <Trans message="Your current plan does not allow music playback." />,
        );
        pause();
        return;
      }
      // log track play
      if (
        cuedMedia &&
        !trackPlays.has(cuedMedia.meta.id) &&
        // only log plays for real numeric track ids (eg. radio stations
        // use uuid-like ids and would hit a garbage play-log endpoint)
        Number.isInteger(Number(cuedMedia.meta.id))
      ) {
        trackPlays.add(cuedMedia.meta.id);
        apiClient.post(`tracks/plays/${cuedMedia.meta.id}/log`, {
          queueId: cuedMedia.groupId,
        });
      }
    },
    playbackEnd: ({state: {cuedMedia}}) => {
      // clear track play
      if (cuedMedia) {
        trackPlays.delete(cuedMedia.meta.id);
        // no longer a direct-stream fallback, stop tracking its id so a
        // future error on a normal track with the same id is not misread
        directStreamCuedIds.delete(`${cuedMedia.id}`);
      }
    },
    error: async ({
      sourceEvent,
      state: {cuedMedia, providerApi, providerName, emit, cue, play},
    }) => {
      const e = sourceEvent as YoutubeProviderError;
      if (providerName === 'youtube' && providerApi) {
        logYoutubeError(e);

        const internalApi = providerApi.internalProviderApi as YoutubeProviderInternalApi;

        // not all errors carry a video id, "not embeddable" plugin errors
        // (100/101/150) fire before any video data arrives, rely on the
        // currently cued embed id in that case
        const videoId = e.videoId || internalApi?.videoId;
        if (!videoId) {
          tracksSkippedDueToError++;
          // "not embeddable" (100/101/150) is the most common failure, so
          // this branch must not be silent either.
          showSkipToast(cuedMedia);

          // try to play up to two next queued tracks if we can't play
          // a video for this one. If we can't play 3 tracks in a row
          // we can assume there's an issue with YouTube API and bail
          if (tracksSkippedDueToError <= 2) {
            emit('playbackEnd');
          }
          return;
        }

        // FIRST try to rotate to a different embed origin (eg. youtube.com
        // vs youtube-nocookie.com). If there is an unused origin left, this
        // reloads the embed with the same video and returns true, so we let
        // the reloaded embed try to play it before giving up on this video.
        if (videoId !== failedVideoId && internalApi.advanceOrigin?.()) {
          return;
        }

        failedVideoIds.add(`${videoId}`);

        const media = cuedMedia
          ? await resolveYoutubeSrc(cuedMedia as YoutubeMediaItem)
          : null;

        // try to play alternative videos we fetched
        if (media?.src && media?.src !== failedVideoId) {
          await internalApi.loadVideoById(media.src);
          providerApi.play();

          // there are no more alternative videos to try, we can error out
        } else if (cuedMedia && videoId) {
          // last resort: try to play a direct html audio stream of this
          // video, bypassing the embed entirely
          const result = await cueDirectStreamFallback(
            cuedMedia,
            videoId,
            cue,
            play,
          );
          if (result === 'playing') {
            tracksSkippedDueToError = 0;
          } else if (result === 'skipped') {
            // no direct stream url available or already tried this one,
            // html audio did not error so nothing was skipped yet
            tracksSkippedDueToError++;
            showSkipToast(cuedMedia);

            // try to play up to two next queued tracks if we can't play
            // a video for this one. If we can't play 3 tracks in a row
            // we can assume there's an issue with YouTube API and bail
            if (tracksSkippedDueToError <= 2) {
              emit('playbackEnd');
            }
          }
          // "handled" means html audio errored out during cue, so its own
          // error event has already skipped the track through the branch
          // below, no need to double count it here
        } else {
          tracksSkippedDueToError++;
          showSkipToast(cuedMedia);

          // try to play up to two next queued tracks if we can't play
          // a video for this one. If we can't play 3 tracks in a row
          // we can assume there's an issue with YouTube API and bail
          if (tracksSkippedDueToError <= 2) {
            emit('playbackEnd');
          }
        }
      } else if (
        providerName === 'htmlAudio' &&
        cuedMedia &&
        directStreamCuedIds.has(`${cuedMedia.id}`)
      ) {
        // direct html audio stream failed to play as well, treat it
        // like any other playback error
        directStreamCuedIds.delete(`${cuedMedia.id}`);
        tracksSkippedDueToError++;
        // every source failed for this track, tell the user before dropping it
        showSkipToast(cuedMedia);

        if (tracksSkippedDueToError <= 2) {
          emit('playbackEnd');
        }
      } else {
        tracksSkippedDueToError = 0;
      }
    },
  },
  onDestroy: () => {
    tracksSkippedDueToError = 0;
  },
};

function showSkipToast(media: MediaItem<Track> | null | undefined) {
  if (!media?.meta) return;
  const name = media.meta.name;
  const artist = media.meta.artists?.[0]?.name;
  const label = artist ? `${name} - ${artist}` : name;
  toast.warning(
    <Trans message="Couldn't play :track — skipping" values={{track: label}} />,
  );
}

function logYoutubeError(e: YoutubeProviderError) {
  const code = e?.code;
  if (!e || !e.videoId || code === 'no_results') return;
  const region =
    (navigator.language || 'XX').split('-').pop()?.toUpperCase() || 'XX';
  apiClient.post('youtube/log-client-error', {
    code,
    videoUrl: e.videoId,
    region,
  });
}

function userHasPlayPermission(): boolean {
  const user = getBootstrapData().user;
  const guest_role = getBootstrapData().guest_role;
  const permissions = user?.permissions || guest_role?.permissions;
  return (
    permissions?.find(p => p.name === 'music.play' || p.name === 'admin') !=
    null
  );
}
