import {ALBUM_MODEL, PartialAlbum} from '@app/web-player/albums/album';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

interface Response extends BackendResponse {
  album: PartialAlbum;
}

export interface ImportAlbumPayload {
  metadataProvider: 'spotify' | 'deezer';
  spotifyId?: string;
  deezerId?: string;
}

export function useImportAlbum() {
  return useMutation({
    mutationFn: (props: ImportAlbumPayload) => importAlbum(props),
    onSuccess: () => {
      toast.success(<Trans message="Album imported" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('albums'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importAlbum(payload: ImportAlbumPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: ALBUM_MODEL,
      ...payload,
    })
    .then(r => r.data);
}
