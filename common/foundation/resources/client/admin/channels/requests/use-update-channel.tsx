import { CreateChannelPayload } from '@common/admin/channels/requests/use-create-channel';
import { Channel } from '@common/channels/channel';
import { channelQueries } from '@common/channels/channel-queries';
import { BackendResponse } from '@common/http/backend-response/backend-response';
import { onFormQueryError } from '@common/http/errors/on-form-query-error';
import { apiClient, queryClient } from '@common/http/query-client';
import { useNavigate } from '@common/ui/navigation/use-navigate';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@shadcn/toast/toast';
import { Trans } from '@ui/i18n/trans';
import { UseFormReturn } from 'react-hook-form';

interface Response extends BackendResponse {
  channel: Channel;
}

export interface UpdateChannelPayload extends CreateChannelPayload {
  id: number;
}

export function useUpdateChannel(form: UseFormReturn<UpdateChannelPayload>) {
  const navigate = useNavigate();
  return useMutation({
    // don't need to send content to the server
    mutationFn: ({id, content, ...payload}: UpdateChannelPayload) =>
      apiClient.put(`channel/${id}`, payload).then(r => r.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: channelQueries.invalidateKey,
      });
      toast.success(<Trans message="Channel updated" />);
      navigate('/admin/channels');
    },
    onError: err => onFormQueryError(err, form),
  });
}
