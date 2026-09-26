import {appQueries} from '@app/app-queries';
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

export function useDeletePlaylist(playlistId: number | string) {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();

  return useMutation({
    mutationFn: () => deletePlaylist(playlistId),
    onSuccess: async () => {
      toast.success(<Trans message="Playlist deleted" />);
      // navigate to homepage if we are on this playlist page currently
      if (pathname.startsWith(`/playlist/${playlistId}`)) {
        navigate(getRedirectUri());
        // wait for navigation to complete, otherwise will try to refetch deleted playlist
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      queryClient.invalidateQueries({
        queryKey: appQueries.playlists.invalidateKey,
        refetchType: 'active',
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function deletePlaylist(playlistId: number | string): Promise<Response> {
  return apiClient.delete(`playlists/${playlistId}`).then(r => r.data);
}
