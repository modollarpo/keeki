import {channelQueries} from '@common/channels/channel-queries';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';

interface Response extends BackendResponse {}

interface Payload {
  preset: string;
}

export function useApplyChannelPreset() {
  return useMutation({
    mutationFn: (payload: Payload) => resetChannels(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: channelQueries.invalidateKey,
      });
      toast.success(<Trans message="Channel preset applied" />);
    },
    onError: err => showHttpErrorToast(err),
  });
}

function resetChannels(payload: Payload) {
  return apiClient
    .post<Response>('channel/apply-preset', payload)
    .then(r => r.data);
}
