import {Channel, ChannelConfig} from '@common/channels/channel';
import {channelQueries} from '@common/channels/channel-queries';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {NormalizedModel} from '@ui/types/normalized-model';

interface Response extends BackendResponse {
  channel: Channel<NormalizedModel>;
}

interface Payload {
  channelConfig?: Partial<ChannelConfig>;
}

export function useUpdateChannelContent(channelId: number | string) {
  return useMutation({
    mutationFn: (payload: Payload) => updateChannel(channelId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: channelQueries.invalidateKey,
      });
      toast.success(<Trans message="Channel content updated" />);
    },
    onError: err => showHttpErrorToast(err),
  });
}

function updateChannel(channelId: number | string, payload: Payload) {
  return apiClient
    .post<Response>(`channel/${channelId}/update-content`, {
      ...payload,
      normalizeContent: true,
    })
    .then(r => r.data);
}
