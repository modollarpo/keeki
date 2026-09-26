import {ARTIST_MODEL, PartialArtist} from '@app/web-player/artists/artist';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

interface Response extends BackendResponse {
  artist: PartialArtist;
}

export interface ImportArtistPayload {
  metadataProvider: 'spotify' | 'deezer';
  spotifyId?: string;
  deezerId?: string;
  importSimilarArtists: boolean;
  importAlbums: boolean;
}

export function useImportArtist() {
  return useMutation({
    mutationFn: (props: ImportArtistPayload) => importArtists(props),
    onSuccess: () => {
      toast.success(<Trans message="Artist imported" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('artists'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importArtists(payload: ImportArtistPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: ARTIST_MODEL,
      ...payload,
    })
    .then(r => r.data);
}
