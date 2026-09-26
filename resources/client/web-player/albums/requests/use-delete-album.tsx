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
  albumId: number;
}

export function useDeleteAlbum() {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();

  return useMutation({
    mutationFn: (payload: Payload) => deleteAlbum(payload),
    onSuccess: (response, {albumId}) => {
      toast.success(<Trans message="Album deleted" />);
      // navigate to homepage if we are on this album page currently
      if (pathname.startsWith(`/album/${albumId}`)) {
        navigate(getRedirectUri());
      }
      queryClient.invalidateQueries({queryKey: ['tracks']});
      queryClient.invalidateQueries({queryKey: ['albums']});
      queryClient.invalidateQueries({queryKey: ['artists']});
    },
    onError: r => showHttpErrorToast(r),
  });
}

function deleteAlbum({albumId}: Payload): Promise<Response> {
  return apiClient.delete(`albums/${albumId}`).then(r => r.data);
}
