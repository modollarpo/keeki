import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';

interface AudiusTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
}

interface Response extends BackendResponse {
  data: AudiusTrack[];
}

export async function findAudiusStream(query: string): Promise<string | null> {
  try {
    const response = await apiClient.get<Response>('audius/search', {
      params: {q: query},
    });
    const tracks = response.data.data;
    if (tracks && tracks.length > 0) {
      return tracks[0].url ?? null;
    }
    return null;
  } catch (e) {
    return null;
  }
}
