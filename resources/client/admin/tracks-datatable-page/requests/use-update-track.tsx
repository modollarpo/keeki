import {
  CreateTrackPayload,
  prepareTrackPayload,
} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {Track} from '@app/web-player/tracks/track';
import {getTrackLink} from '@app/web-player/tracks/track-link';
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

export interface UpdateTrackResponse extends BackendResponse {
  track: Track;
}

export interface UpdateTrackPayload extends CreateTrackPayload {
  id: number;
}

const Endpoint = (id: number) => `tracks/${id}`;

export function useUpdateTrack(
  form: UseFormReturn<UpdateTrackPayload>,
  trackId: number,
) {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  return useMutation({
    mutationFn: (payload: UpdateTrackPayload) =>
      updateTrack(trackId, payload),
    onSuccess: response => {
      toast.success(<Trans message="Track updated" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('tracks'),
      });
      if (pathname.includes('admin')) {
        navigate('/admin/tracks');
      } else {
        navigate(getTrackLink(response.track));
      }
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateTrack(
  id: number,
  payload: UpdateTrackPayload,
): Promise<UpdateTrackResponse> {
  return apiClient
    .put(Endpoint(id), prepareTrackPayload(payload as CreateTrackPayload))
    .then(r => r.data);
}
