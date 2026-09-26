import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {Trans} from '@ui/i18n/trans';

export function ChannelSeoFields() {
  return (
    <>
      <HookForm.Field name="config.seoTitle">
        <Field.Label>
          <Trans message="SEO title" />
        </Field.Label>
        <Input />
        <Field.Error />
      </HookForm.Field>
      <HookForm.Field name="config.seoDescription">
        <Field.Label>
          <Trans message="SEO description" />
        </Field.Label>
        <Textarea rows={6} />
        <Field.Error />
      </HookForm.Field>
    </>
  );
}
