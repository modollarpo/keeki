import {Track} from '@app/web-player/tracks/track';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {CancelTokenSource} from 'axios';

interface Response extends BackendResponse {
  results: {title: string; id: string}[];
}

const endpoint = (track: Track, region?: string) => {
  const artistName =
    track.artists?.[0]?.name || track.album?.artists?.[0]?.name;
  const base = `search/audio/${track.id}/${doubleEncode(artistName!)}/${doubleEncode(
    track.name,
  )}`;
  return region ? `${base}?region=${region}` : base;
};

export let isSearchingForYoutubeVideo = false;

// coarse region hint (usually derived from browser locale), used to scope
// the blocklist of videos that failed to play for a given region
function getRegion(): string {
  return (navigator.language || 'XX').split('-').pop()?.toUpperCase() || 'XX';
}

// Pre-warms the query cache for the given tracks so their video IDs are ready
// before the user reaches them in the queue. Fire-and-forget — never throws.
export function prefetchYoutubeVideoIds(tracks: Track[]): void {
  const region = getRegion();
  for (const track of tracks) {
    const query = {
      queryKey: [endpoint(track, region)],
      queryFn: () => findMatch(track, undefined, region),
      staleTime: Infinity,
    };
    // skip if already cached
    if (!queryClient.getQueryData(query.queryKey)) {
      queryClient.prefetchQuery(query).catch(() => {});
    }
  }
}

export async function findYoutubeVideosForTrack(
  track: Track,
  cancelToken?: CancelTokenSource,
): Promise<Response['results']> {
  const region = getRegion();
  const query = {
    queryKey: [endpoint(track, region)],
    queryFn: async () => findMatch(track, cancelToken, region),
    staleTime: Infinity,
  };

  let response: Response | undefined;

  try {
    response =
      queryClient.getQueryData<Response>(query.queryKey) ??
      (await queryClient.fetchQuery(query));
  } catch {
    //
  }

  isSearchingForYoutubeVideo = false;

  return response?.results || [];
}

function findMatch(
  track: Track,
  cancelToken?: CancelTokenSource,
  region?: string,
): Promise<Response> {
  isSearchingForYoutubeVideo = true;
  return apiClient
    .get(endpoint(track, region), {cancelToken: cancelToken?.token})
    .then(response => response.data);
}

function doubleEncode(value: string) {
  return encodeURIComponent(encodeURIComponent(value));
}
