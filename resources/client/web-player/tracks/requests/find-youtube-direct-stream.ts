import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';

interface Response extends BackendResponse {
  url: string;
}

// tries to resolve a directly playable audio url for a youtube video
// (bypasses the embed player, used as a last-resort fallback when
// youtube embed errors out or the video is not embeddable)
export async function findYoutubeDirectStream(
  videoId: string,
): Promise<string | null> {
  try {
    const response = await apiClient.get<Response>(
      `youtube/streams/${videoId}`,
    );
    return response.data.url ?? null;
  } catch (e) {
    return null;
  }
}