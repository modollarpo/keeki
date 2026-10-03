import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {PlayableGridItem} from '@app/web-player/playable-item/playable-grid-item';
import {
  ContentCarouselNav,
  useContentCarouselControls,
} from '@app/web-player/playable-item/content-carousel-nav';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink, TrackLink} from '@app/web-player/tracks/track-link';
import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {Track} from '@app/web-player/tracks/track';
import {Channel} from '@common/channels/channel';
import {apiClient} from '@common/http/query-client';
import {useQuery} from '@tanstack/react-query';
import {Skeleton} from '@ui/skeleton/skeleton';

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

type PersonalizedEndpoint = 'recently-played' | 'made-for-you';

interface PersonalizedResponse {
  tracks: Track[];
  is_personalized: boolean;
}

function usePersonalizedTracks(endpoint: PersonalizedEndpoint) {
  return useQuery({
    queryKey: ['personalized', endpoint],
    queryFn: () =>
      apiClient
        .get<PersonalizedResponse>(`personalized/${endpoint}`)
        .then(r => r.data),
    staleTime: endpoint === 'recently-played' ? 15 * 60 * 1000 : 60 * 60 * 1000,
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

interface Props {
  channel: Channel;
  endpoint: PersonalizedEndpoint;
  /** Effective layout pre-computed by ChannelContent (resolves nestedLayout). */
  layout?: string | null;
}

/**
 * Renders a personalized channel row (Recently Played / Made For You) by
 * fetching tracks from `/api/personalized/{endpoint}`.
 *
 * Renders its own carousel instead of re-using the synthetic-channel hack so
 * that every TrackGridItem in the queue carries a consistent channel-scoped
 * queueGroupId. Without this, queue autoplay breaks when the player tries to
 * load the "next page" via `loadMediaItemTracks("track.{id}.*")` — a queueId
 * that PlayerTracksController doesn't handle.
 *
 * Each item receives the full `tracks` array as `newQueue` so clicking play
 * on any card queues the whole row, and the player can advance through it.
 */
export function PersonalizedChannelContent({channel, endpoint}: Props) {
  const {data, isLoading} = usePersonalizedTracks(endpoint);

  if (isLoading) {
    return <PersonalizedSkeleton />;
  }

  const tracks = data?.tracks ?? [];

  if (!tracks.length) {
    return null;
  }

  return <PersonalizedCarousel channel={channel} tracks={tracks} />;
}

// ---------------------------------------------------------------------------
// Carousel — owns the queue threading
// ---------------------------------------------------------------------------

interface CarouselProps {
  channel: Channel;
  tracks: Track[];
}

function PersonalizedCarousel({channel, tracks}: CarouselProps) {
  const controls = useContentCarouselControls();

  return (
    <div>
      {/* ChannelHeading renders the section title + "See all" link to /{channel.slug} */}
      <ChannelHeading channel={channel} isNested />

      <ContentCarouselNav controls={controls}>
        <div className="@container w-full min-w-0">
          <ContentGrid isCarousel contentModel="track" containerRef={controls.containerRefCallback}>
            {tracks.map(track => (
              <PlayableGridItem
                key={track.id}
                layout={undefined}
                image={<TrackImage track={track} />}
                title={<TrackLink track={track} />}
                subtitle={
                  <ArtistLinks artists={track.artists} />
                }
                link={getTrackLink(track)}
                likeButton={<LikeIconButton likeable={track} />}
                model={track}
                // Pass the full track list as the queue so:
                // 1. clicking play on any item queues the whole row
                // 2. the player can advance to the next/previous track
                //    without hitting the server for an unknown queueId
                newQueue={tracks}
                contextDialog={<TrackContextDialog tracks={[track]} type="dropdown" />}
              />
            ))}
          </ContentGrid>
        </div>
      </ContentCarouselNav>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PersonalizedSkeleton() {
  return (
    <div className="py-4">
      <Skeleton variant="rect" className="mb-4 h-7 w-48 rounded" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({length: 6}).map((_, i) => (
          <Skeleton
            key={i}
            variant="rect"
            className="h-40 w-40 shrink-0 rounded-[var(--be-radius-card-sm)]"
          />
        ))}
      </div>
    </div>
  );
}
