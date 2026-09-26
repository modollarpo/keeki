import {CreateArtistPayload} from '@app/admin/artist-datatable-page/requests/use-create-artist';
import {PartialArtist} from '@app/web-player/artists/artist';
import {getArtistLink} from '@app/web-player/artists/artist-link';
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
  artist: PartialArtist;
}

export interface UpdateArtistPayload extends CreateArtistPayload {
  id: number;
}

const Endpoint = (id: number) => `artists/${id}`;

export function useUpdateArtist(form: UseFormReturn<UpdateArtistPayload>) {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  return useMutation({
    mutationFn: (payload: UpdateArtistPayload) => updateAlbum(payload),
    onSuccess: response => {
      toast.success(<Trans message="Artist updated" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('artists'),
      });
      if (pathname.includes('admin')) {
        navigate('/admin/artists');
      } else {
        navigate(getArtistLink(response.artist));
      }
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateAlbum({id, ...payload}: UpdateArtistPayload): Promise<Response> {
  return apiClient.put(Endpoint(id), payload).then(r => r.data);
}
