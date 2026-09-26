import {CreateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {UpdateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-update-track';
import {Track} from '@app/web-player/tracks/track';
import {useForm} from 'react-hook-form';

export function useUpdateTrackForm(
  track: UpdateTrackPayload | CreateTrackPayload | Omit<Track, 'lyric'>,
) {
  const form = useForm<UpdateTrackPayload>({
    defaultValues: {
      ...track,
      image: track.image || (track as Track).album?.image,
    },
  });
  return {form};
}
