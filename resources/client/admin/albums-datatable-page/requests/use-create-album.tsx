import {
  CreateTrackPayload,
  prepareTrackPayload,
} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {FullAlbum, PartialAlbum} from '@app/web-player/albums/album';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {NormalizedModel} from '@ui/types/normalized-model';
import {UseFormReturn} from 'react-hook-form';

const endpoint = 'albums';

interface Response extends BackendResponse {
  album: FullAlbum;
}

export type CreateAlbumPayloadTrack = Omit<
  CreateTrackPayload,
  'album' | 'artists' | 'lyric'
> & {
  uploadId: string;
};

export interface CreateAlbumPayload extends Omit<
  PartialAlbum,
  'genres' | 'tags' | 'tracks' | 'artists'
> {
  description?: string | null;
  spotify_id?: string | null;
  artists: NormalizedModel[];
  genres?: NormalizedModel[] | string[];
  tags?: NormalizedModel[];
  tracks: CreateAlbumPayloadTrack[];
}

export function useCreateAlbum(form: UseFormReturn<CreateAlbumPayload>) {
  return useMutation({
    mutationFn: (payload: CreateAlbumPayload) => createAlbum(payload),
    onSuccess: () => {
      toast.success(<Trans message="Album created" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint),
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createAlbum(payload: CreateAlbumPayload) {
  return apiClient
    .post<Response>(endpoint, prepareAlbumPayload(payload))
    .then(r => r.data);
}

export function prepareAlbumPayload(payload: CreateAlbumPayload) {
  return {
    ...payload,
    artists: payload.artists?.map(artist => artist.id),
    tracks: payload.tracks?.map(track => prepareTrackPayload(track)),
  };
}
