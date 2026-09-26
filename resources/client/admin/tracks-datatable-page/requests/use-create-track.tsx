import {TrackUploadPayload} from '@app/web-player/backstage/upload-page/use-track-uploader';
import {Track} from '@app/web-player/tracks/track';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {NormalizedModel} from '@ui/types/normalized-model';
import {UseFormReturn} from 'react-hook-form';

const endpoint = 'tracks';

export interface CreateTrackResponse extends BackendResponse {
  track: Track;
}

export interface CreateTrackPayload {
  name: string;
  description?: string | null;
  duration?: number | null;
  image?: string | null;
  src?: string | null;
  spotify_id?: string;
  album_id?: number;
  artists?: NormalizedModel[];
  genres?: NormalizedModel[] | string[];
  tags?: NormalizedModel[];
  waveData?: number[][];
  lyric?: string;
}

export function useCreateTrack(
  form: UseFormReturn<CreateTrackPayload> | UseFormReturn<TrackUploadPayload>,
) {
  return useMutation({
    mutationFn: (payload: CreateTrackPayload) => createTrack(payload),
    onSuccess: () => {
      toast.success(<Trans message="Track created" />);
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint),
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createTrack(payload: CreateTrackPayload) {
  return apiClient
    .post<CreateTrackResponse>(endpoint, prepareTrackPayload(payload))
    .then(r => r.data);
}

export function prepareTrackPayload(payload: CreateTrackPayload) {
  return {
    ...payload,
    album_id: payload.album_id ? payload.album_id : null,
    artists: payload.artists?.map(artist => artist.id),
  };
}
