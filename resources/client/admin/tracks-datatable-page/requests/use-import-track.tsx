import {Track, TRACK_MODEL} from '@app/web-player/tracks/track';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

interface Response extends BackendResponse {
  track: Track;
}

export interface ImportTrackPayload {
  metadataProvider: 'spotify' | 'deezer';
  spotifyId?: string;
  deezerId?: string;
  importLyrics: boolean;
}

export function useImportTrack() {
  return useMutation({
    mutationFn: (props: ImportTrackPayload) => importTrack(props),
    onSuccess: () => {
      toast.success(<Trans message="Track imported" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('tracks'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importTrack(payload: ImportTrackPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: TRACK_MODEL,
      ...payload,
    })
    .then(r => r.data);
}
