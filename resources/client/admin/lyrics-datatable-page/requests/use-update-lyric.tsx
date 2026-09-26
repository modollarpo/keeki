import {CreateLyricPayload} from '@app/admin/lyrics-datatable-page/requests/use-create-lyric';
import {appQueries} from '@app/app-queries';
import {Lyric} from '@app/web-player/tracks/lyrics/lyric';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';

interface Response extends BackendResponse {
  lyric: Lyric;
}

export interface UpdateLyricPayload extends CreateLyricPayload {
  id: number;
}

export function useUpdateLyric(form: UseFormReturn<UpdateLyricPayload>) {
  return useMutation({
    mutationFn: (props: UpdateLyricPayload) => updateLyric(props),
    onSuccess: () => {
      toast.success(<Trans message="Lyric updated" />);
      queryClient.invalidateQueries({
        queryKey: appQueries.lyrics.invalidateKey,
      });
      queryClient.invalidateQueries({
        queryKey: appQueries.tracks.invalidateKey,
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateLyric({id, ...payload}: UpdateLyricPayload): Promise<Response> {
  return apiClient
    .put(`lyrics/${id}`, {
      ...payload,
      track_id: Number(payload.track_id),
      duration: payload.duration != null ? Number(payload.duration) : null,
    })
    .then(r => r.data);
}
