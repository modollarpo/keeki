import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Trans} from '@ui/i18n/trans';

export function CrupdateTagForm() {
  return (
    <Field.Group>
      <HookForm.Field name="name">
        <Field.Label>
          <Trans message="Name" />
        </Field.Label>
        <Input required autoFocus />
        <Field.Description>
          <Trans message="Unique tag identifier." />
        </Field.Description>
        <Field.Error />
      </HookForm.Field>
      <HookForm.Field name="display_name">
        <Field.Label>
          <Trans message="Display name" />
        </Field.Label>
        <Input />
        <Field.Description>
          <Trans message="User friendly tag name." />
        </Field.Description>
        <Field.Error />
      </HookForm.Field>
    </Field.Group>
  );
}
