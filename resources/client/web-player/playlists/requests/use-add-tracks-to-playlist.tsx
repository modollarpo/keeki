import {appQueries} from '@app/app-queries';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {Track} from '@app/web-player/tracks/track';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

interface Response extends BackendResponse {
  playlist: PartialPlaylist;
}

interface Payload {
  playlistId: number;
  tracks: Track[];
}

export function useAddTracksToPlaylist() {
  return useMutation({
    mutationFn: (payload: Payload) => addTracks(payload),
    onSuccess: (response, {tracks}) => {
      toast.success(
        <Trans
          message="Added [one 1 track|other :count tracks] to playlist"
          values={{count: tracks.length}}
        />,
      );
      queryClient.invalidateQueries({
        queryKey: appQueries.playlists.show(response.playlist.id).invalidateKey,
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function addTracks(payload: Payload): Promise<Response> {
  const backendPayload = {
    ids: payload.tracks.map(track => track.id),
  };
  return apiClient
    .post(`playlists/${payload.playlistId}/tracks/add`, backendPayload)
    .then(r => r.data);
}
