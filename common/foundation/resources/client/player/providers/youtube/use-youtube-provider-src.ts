import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useCallback, useEffect, useState} from 'react';
import {YoutubeMediaItem} from '@common/player/media-item';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {youtubeIdFromSrc} from '@common/player/utils/youtube-id-from-src';

const queryString =
  'controls=0&playsinline=1&enablejsapi=1';

export function useYoutubeProviderSrc(
  loadVideoById: (videoId: string) => void
) {
  const {getState, emit} = usePlayerActions();
  const options = usePlayerStore(s => s.options);
  const media = usePlayerStore(s => s.cuedMedia) as
    | YoutubeMediaItem
    | undefined;

  const origins = options.youtube?.origins?.length
    ? options.youtube.origins
    : options.youtube?.useCookies
      ? ['https://www.youtube.com', 'https://www.youtube-nocookie.com']
      : ['https://www.youtube-nocookie.com', 'https://www.youtube.com'];

  const [originIndex, setOriginIndex] = useState(0);
  const origin = origins[originIndex] ?? origins[0];

  // reset origin to the first one when a different track is cued,
  // so each track starts on the preferred origin
  useEffect(() => {
    setOriginIndex(0);
  }, [media?.id]);

  const advanceOrigin = useCallback(() => {
    if (originIndex < origins.length - 1) {
      setOriginIndex(i => i + 1);
      return true;
    }
    return false;
  }, [originIndex, origins.length]);

  const [initialVideoId, setInitialVideoId] = useState(() => {
    if (media?.src && media.src !== 'resolve') {
      return youtubeIdFromSrc(media.src);
    }
  });

  const updateVideoIds = useCallback(
    (src: string) => {
      // If src is ' ', the track had no search results. Emit an error
      // so the fallback waterfall (Audius/Jamendo) is triggered.
      if (src === ' ') {
        setTimeout(() => {
          emit('error', {sourceEvent: {videoId: ' ', code: 'no_results'}});
        }, 0);
        return;
      }

      const videoId = youtubeIdFromSrc(src);
      if (!videoId) return;

      // use setState callback, so we don't need to use "initialVideoId" in the dependency array
      setInitialVideoId(prevId => {
        if (!prevId) {
          return videoId;
        } else {
          // changing src of iframe will cause it to fully reload, use "loadVideoById" api method instead
          loadVideoById(videoId);
          return prevId;
        }
      });
    },
    [loadVideoById, emit]
  );

  useEffect(() => {
    if (media?.src && media.src !== 'resolve') {
      updateVideoIds(media.src);
    } else if (media) {
      emit('buffering', {isBuffering: true});
      options.youtube?.srcResolver?.(media)
        .then(item => {
          // check if resolved media matches the one currently in the store to prevent race conditions.
          // check against current value in store, because this callback will close over old value
          if (item?.src && getState().cuedMedia?.id === item.id) {
            updateVideoIds(item.src);
          }
        })
        .catch(() => {
          // a rejected lookup (eg. transient network error) must not surface as
          // an unhandled rejection, and must not leave the player buffering
          // forever. Reuse the no-results path so the direct-stream fallback
          // waterfall still runs and the track still gets skipped with a toast.
          if (getState().cuedMedia?.id === media.id) {
            // deferred exactly like the src === ' ' branch in updateVideoIds,
            // so this emits from a macrotask and not from inside the rejection
            setTimeout(() => {
              emit('error', {sourceEvent: {videoId: ' ', code: 'no_results'}});
            }, 0);
          }
        });
    }
    // only update when media id changes to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, updateVideoIds, media?.id]);

  return {
    initialVideoUrl: initialVideoId
      ? `${origin}/embed/${initialVideoId}?${queryString}&autoplay=1&mute=${
          getState().muted ? '1' : '0'
        }&start=${media?.initialTime ?? 0}`
      : undefined,
    origin,
    advanceOrigin,
    videoId: initialVideoId,
  };
}
