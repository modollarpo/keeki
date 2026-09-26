import {useAuth} from '@common/auth/use-auth';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {useLocation} from 'react-router';

interface Response extends BackendResponse {}

interface Payload {
  trackIds: number[];
}

export function useDeleteTracks() {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();

  return useMutation({
    mutationFn: (payload: Payload) => deleteTracks(payload),
    onSuccess: async (response, {trackIds}) => {
      await queryClient.invalidateQueries({queryKey: ['tracks']});
      await queryClient.invalidateQueries({queryKey: ['channel']});
      toast.success(
        <Trans
          message="[one Track|other :count Tracks] deleted"
          values={{count: trackIds.length}}
        />,
      );
      // navigate to homepage if we are on this track page currently
      if (trackIds.some(trackId => pathname.startsWith(`/track/${trackId}`))) {
        navigate(getRedirectUri());
      }
    },
    onError: r => showHttpErrorToast(r),
  });
}

function deleteTracks({trackIds}: Payload): Promise<Response> {
  return apiClient.delete(`tracks/${trackIds.join(',')}`).then(r => r.data);
}
