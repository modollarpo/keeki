import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

interface Response extends BackendResponse {}

interface Payload {
  user: {
    id: number;
    name: string;
  };
}

export function useUnfollowUser() {
  return useMutation({
    mutationFn: (payload: Payload) => unfollowUser(payload),
    onSuccess: async (response, {user}) => {
      await queryClient.invalidateQueries({queryKey: ['users']});
      toast.success(
        <Trans message="Stopped following :name" values={{name: user.name}} />,
      );
    },
    onError: r => showHttpErrorToast(r),
  });
}

function unfollowUser({user}: Payload): Promise<Response> {
  return apiClient.post(`users/${user.id}/unfollow`).then(r => r.data);
}
