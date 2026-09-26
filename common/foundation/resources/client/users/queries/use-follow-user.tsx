import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

interface Payload {
  user: {
    id: number;
    name: string;
  };
}

export function useFollowUser() {
  return useMutation({
    mutationFn: (payload: Payload) =>
      apiClient.post(`users/${payload.user.id}/follow`).then(r => r.data),
    onSuccess: async (response, {user}) => {
      await queryClient.invalidateQueries({queryKey: ['users']});
      toast.success(
        <Trans message="Following :name" values={{name: user.name}} />,
      );
    },
    onError: r => showHttpErrorToast(r),
  });
}
