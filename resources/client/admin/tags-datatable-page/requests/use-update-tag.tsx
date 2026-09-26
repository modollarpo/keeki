import {CreateTagPayload} from '@app/admin/tags-datatable-page/requests/use-create-tag';
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

export interface UpdateTagPayload extends CreateTagPayload {
  id: number;
}

export function useUpdateTag(form: UseFormReturn<UpdateTagPayload>) {
  return useMutation({
    mutationFn: (props: UpdateTagPayload) => updateTag(props),
    onSuccess: () => {
      toast.success(<Trans message="Tag updated" />);
      queryClient.invalidateQueries({
        queryKey: appQueries.tags.invalidateKey,
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateTag({id, ...payload}: UpdateTagPayload): Promise<Response> {
  return apiClient.put(`tags/${id}`, payload).then(r => r.data);
}
