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

export function useDeleteArtist(artistId: number | string) {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();

  return useMutation({
    mutationFn: () => deleteArtist(artistId),
    onSuccess: () => {
      toast.success(<Trans message="Artist deleted" />);
      // navigate to homepage if we are on this artist page currently
      if (pathname.startsWith(`/artist/${artistId}`)) {
        navigate(getRedirectUri());
      }
      queryClient.invalidateQueries({queryKey: ['tracks']});
      queryClient.invalidateQueries({queryKey: ['albums']});
      queryClient.invalidateQueries({queryKey: ['artists']});
    },
    onError: r => showHttpErrorToast(r),
  });
}

function deleteArtist(artistId: number | string): Promise<Response> {
  return apiClient.delete(`artists/${artistId}`).then(r => r.data);
}
