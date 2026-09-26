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

export interface CreateGenrePayload {
  name: string;
  display_name: string;
  image: string;
}

export function useCreateGenre(form: UseFormReturn<CreateGenrePayload>) {
  return useMutation({
    mutationFn: (props: CreateGenrePayload) => createGenre(props),
    onSuccess: () => {
      toast.success(<Trans message="Genre created" />);
      queryClient.invalidateQueries({
        queryKey: appQueries.genres.invalidateKey,
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createGenre(payload: CreateGenrePayload): Promise<Response> {
  return apiClient.post('genres', payload).then(r => r.data);
}
