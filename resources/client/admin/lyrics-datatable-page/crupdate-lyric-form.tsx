import {
  listNormalizedModels,
  retrieveNormalizedModel,
} from '@app/gen/normalized-models';
import {ListNormalizedModels200DataItem} from '@app/gen/schemas/list-normalized-models200-data-item';
import {TRACK_MODEL} from '@app/web-player/tracks/track';
import {Avatar} from '@shadcn/avatar/avatar';
import {ModelSelect} from '@shadcn/forms/combobox/model-select';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Switch} from '@shadcn/forms/switch/switch';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {keepPreviousData, queryOptions} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useWatch} from 'react-hook-form';

export function CrupdateLyricForm() {
  const isSynced = useWatch({name: 'is_synced'});

  return (
    <Field.Group>
      <HookForm.Field name="track_id">
        <Field.Label>
          <Trans message="Track" />
        </Field.Label>
        <ModelSelect
          placeholder={<Trans message="Select track" />}
          listOptions={({query}) =>
            queryOptions({
              queryKey: [TRACK_MODEL, 'normalized-models', {query}],
              placeholderData: keepPreviousData,
              queryFn: () =>
                listNormalizedModels(TRACK_MODEL, {
                  query,
                  include: 'artists,album',
                }),
            })
          }
          retrieveOptions={({id}) =>
            queryOptions({
              queryKey: [TRACK_MODEL, 'normalized-models', `${id}`],
              queryFn: () =>
                retrieveNormalizedModel(TRACK_MODEL, Number(id), {
                  include: 'artists,album',
                }),
            })
          }
          modelToLabel={(track: ListNormalizedModels200DataItem) => track.name}
          modelToImage={(track: ListNormalizedModels200DataItem) => (
            <Avatar.Root size="sm">
              <Avatar.Image src={track.image ?? undefined} alt="" />
              <Avatar.ColorFallback>{track.name}</Avatar.ColorFallback>
            </Avatar.Root>
          )}
          modelToDescription={(track: ListNormalizedModels200DataItem) =>
            track.description
          }
        />
        <Field.Error />
      </HookForm.Field>
      <HookForm.Field name="is_synced">
        <Field.Label>
          <Switch />
          <Trans message="Synced" />
        </Field.Label>
        <Field.Description>
          <Trans message="Whether lyric contains timestamps" />
        </Field.Description>
        <Field.Error />
      </HookForm.Field>
      {isSynced ? (
        <HookForm.Field name="duration">
          <Field.Label>
            <Trans message="Duration" />
          </Field.Label>
          <Input required type="number" min={1} />
          <Field.Description>
            <Trans message="Lyric duration in seconds. If this duration does not match the duration of track that is being played, lyric sync will be disabled and plain lyrics will be shown instead." />
          </Field.Description>
          <Field.Error />
        </HookForm.Field>
      ) : null}
      <HookForm.Field name="text">
        <Field.Label>
          <Trans message="Text" />
        </Field.Label>
        <Textarea rows={16} />
        <Field.Error />
      </HookForm.Field>
    </Field.Group>
  );
}
