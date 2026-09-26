import {
  PartialPlaylist,
  PLAYLIST_MODEL,
} from '@app/web-player/playlists/playlist';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

interface Response extends BackendResponse {
  playlist: PartialPlaylist;
}

export interface ImportPlaylistPayload {
  metadataProvider: 'spotify' | 'deezer';
  spotifyId?: string;
  deezerId?: string;
}

export function useImportPlaylist() {
  return useMutation({
    mutationFn: (props: ImportPlaylistPayload) => importArtists(props),
    onSuccess: () => {
      toast.success(<Trans message="Playlist imported" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('playlists'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importArtists(payload: ImportPlaylistPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: PLAYLIST_MODEL,
      ...payload,
    })
    .then(r => r.data);
}
