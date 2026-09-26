import {appQueries} from '@app/app-queries';
import {Tag} from '@app/web-player/tags/tag';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';

interface Response extends BackendResponse {
  data: Tag;
}

export interface CreateTagPayload {
  name: string;
  display_name: string;
}

export function useCreateTag(form: UseFormReturn<CreateTagPayload>) {
  return useMutation({
    mutationFn: (props: CreateTagPayload) => createTag(props),
    onSuccess: () => {
      toast.success(<Trans message="Tag created" />);
      queryClient.invalidateQueries({
        queryKey: appQueries.tags.invalidateKey,
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createTag(payload: CreateTagPayload): Promise<Response> {
  return apiClient.post('tags', payload).then(r => r.data);
}
