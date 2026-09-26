import {
  CreateAlbumPayload,
  prepareAlbumPayload,
} from '@app/admin/albums-datatable-page/requests/use-create-album';
import {PartialAlbum} from '@app/web-player/albums/album';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {UseFormReturn} from 'react-hook-form';
import {useLocation} from 'react-router';

interface Response extends BackendResponse {
  album: PartialAlbum;
}

export interface UpdateAlbumPayload extends CreateAlbumPayload {
  id: number;
}

const Endpoint = (id: number) => `albums/${id}`;

export function useUpdateAlbum(
  form: UseFormReturn<UpdateAlbumPayload>,
  albumId: number,
) {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  return useMutation({
    mutationFn: (payload: UpdateAlbumPayload) => updateAlbum(albumId, payload),
    onSuccess: response => {
      toast.success(<Trans message="Album updated" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('albums'),
      });
      if (pathname.includes('admin')) {
        navigate('/admin/albums');
      } else {
        navigate(getAlbumLink(response.album));
      }
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateAlbum(
  id: number,
  payload: UpdateAlbumPayload,
): Promise<Response> {
  return apiClient
    .put(Endpoint(id), prepareAlbumPayload(payload))
    .then(r => r.data);
}
