import {Track} from '@app/web-player/tracks/track';
import {ChannelContentCarousel} from '@app/web-player/channels/channel-content-carousel';
import {ChannelContentGrid} from '@app/web-player/channels/channel-content-grid';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {apiClient} from '@common/http/query-client';
import {Channel} from '@common/channels/channel';
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
  /** Which sub-type to render. Stored in channel.config.autoUpdateMethod. */
  endpoint: PersonalizedEndpoint;
}

/**
 * Renders a personalized channel row by fetching from the server-side
 * `/api/personalized/{endpoint}` endpoint. The channel's configured
 * layout (carousel, grid, etc.) is respected unchanged.
 *
 * Shows a skeleton row while loading so the page layout doesn't shift.
 * Hides the row entirely when the endpoint returns zero tracks (prevents
 * an empty, broken row for new users before the server fallback kicks in).
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

  // Re-use the existing channel rendering stack by temporarily injecting the
  // personalized tracks as the channel's content. This avoids duplicating any
  // grid/carousel layout logic.
  // Cast via unknown: the spread preserves all Channel fields; only `content`
  // and `items` differ, and we own both here.
  const syntheticChannel = {
    ...channel,
    items: tracks,
    content: {
      data: tracks,
      current_page: 1,
      per_page: tracks.length,
      total: tracks.length,
      from: 1,
      to: tracks.length,
      last_page: 1,
    } as any,
  } as unknown as Channel<Track>;

  const layout = channel.config.layout;

  if (layout === 'carousel' || layout === 'compactGrid') {
    return (
      <ChannelContentCarousel
        channel={syntheticChannel}
        layout={layout === 'compactGrid' ? 'compact' : undefined}
      />
    );
  }

  return (
    <div>
      <ChannelHeading channel={syntheticChannel} />
      <ChannelContentGrid channel={syntheticChannel} />
    </div>
  );
}

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
