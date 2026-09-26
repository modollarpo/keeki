import {FullArtist, PartialArtist} from '@app/web-player/artists/artist';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {UseFormReturn} from 'react-hook-form';

const endpoint = 'artists';

interface Response extends BackendResponse {
  artist: PartialArtist;
}

export interface CreateArtistPayload {
  name?: string;
  image_small?: string;
  verified?: boolean;
  spotify_id?: string;
  genres?: FullArtist['genres'];
  links?: FullArtist['links'];
  profile?: FullArtist['profile'];
  profile_images?: {
    url: string;
    id?: number;
  }[];
  disabled?: boolean;
}

export function useCreateArtist(form: UseFormReturn<CreateArtistPayload>) {
  return useMutation({
    mutationFn: (payload: CreateArtistPayload) => createAlbum(payload),
    onSuccess: () => {
      toast.success(<Trans message="Artist created" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint),
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createAlbum(payload: CreateArtistPayload) {
  return apiClient.post<Response>(endpoint, payload).then(r => r.data);
}
