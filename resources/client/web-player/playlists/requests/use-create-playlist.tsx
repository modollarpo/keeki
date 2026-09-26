import {appQueries} from '@app/app-queries';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {UseFormReturn} from 'react-hook-form';

interface Response extends BackendResponse {
  playlist: PartialPlaylist;
}

export interface CreatePlaylistPayload {
  name: string;
  public: boolean;
  collaborative: boolean;
  image: string | null;
  description: string;
}

export function useCreatePlaylist(form: UseFormReturn<CreatePlaylistPayload>) {
  return useMutation({
    mutationFn: (payload: CreatePlaylistPayload) =>
      apiClient.post<Response>('playlists', payload).then(r => r.data),
    onSuccess: () => {
      toast.success(<Trans message="Playlist created" />);
      queryClient.invalidateQueries({
        queryKey: appQueries.playlists.invalidateKey,
      });
    },
    onError: r => onFormQueryError(r, form),
  });
}
