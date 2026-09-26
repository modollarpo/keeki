import {
  CreateTrackPayload,
} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {useForm} from 'react-hook-form';

interface Props {
  defaultValues?: Partial<CreateTrackPayload>;
}

export function useCreateTrackForm({defaultValues}: Props = {}) {
  const form = useForm<CreateTrackPayload>({
    defaultValues,
  });
  return {form};
}
