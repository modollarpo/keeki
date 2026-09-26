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

export interface CreateLyricPayload {
  track_id: number;
  text: string;
  is_synced: boolean;
  duration: number | null;
}

export function useCreateLyric(form: UseFormReturn<CreateLyricPayload>) {
  return useMutation({
    mutationFn: (props: CreateLyricPayload) => createLyric(props),
    onSuccess: () => {
      toast.success(<Trans message="Lyric created" />);
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

function createLyric(payload: CreateLyricPayload): Promise<Response> {
  return apiClient
    .post('lyrics', {
      ...payload,
      track_id: Number(payload.track_id),
      duration: payload.duration != null ? Number(payload.duration) : null,
    })
    .then(r => r.data);
}
