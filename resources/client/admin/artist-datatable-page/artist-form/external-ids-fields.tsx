import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';

type Props = {
  inline?: boolean;
};
export function ExternalIdsFields({inline}: Props) {
  return (
    <div
      className={cn(
        inline ? 'flex flex-wrap gap-3' : 'flex flex-col gap-5',
      )}
    >
      <HookForm.Field
        name="spotify_id"
        className={cn(inline && 'flex-1')}
      >
        <Field.Label>
          <Trans message="Spotify ID" />
        </Field.Label>
        <Input minLength={22} maxLength={22} />
        <Field.Error />
      </HookForm.Field>
      <HookForm.Field name="deezer_id" className={cn(inline && 'flex-1')}>
        <Field.Label>
          <Trans message="Deezer ID" />
        </Field.Label>
        <Input type="number" />
        <Field.Error />
      </HookForm.Field>
    </div>
  );
}
