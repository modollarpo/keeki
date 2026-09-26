import {CreateGenrePayload} from '@app/admin/genres-datatable-page/requests/use-create-genre';
import {appQueries} from '@app/app-queries';
import {Genre} from '@app/web-player/genres/genre';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';

interface Response extends BackendResponse {
  genre: Genre;
}

export interface UpdateGenrePayload extends CreateGenrePayload {
  id: number;
}

export function useUpdateGenre(form: UseFormReturn<UpdateGenrePayload>) {
  return useMutation({
    mutationFn: (props: UpdateGenrePayload) => updateGenre(props),
    onSuccess: () => {
      toast.success(<Trans message="Genre updated" />);
      queryClient.invalidateQueries({
        queryKey: appQueries.genres.invalidateKey,
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateGenre({id, ...payload}: UpdateGenrePayload): Promise<Response> {
  return apiClient.put(`genres/${id}`, payload).then(r => r.data);
}
