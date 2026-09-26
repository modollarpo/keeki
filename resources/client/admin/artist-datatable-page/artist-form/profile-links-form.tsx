import {ProfileLink} from '@app/web-player/users/user-profile';
import {Button} from '@shadcn/button/button';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Trans} from '@ui/i18n/trans';
import {PlusIcon, XIcon} from 'lucide-react';
import {useFieldArray} from 'react-hook-form';

export function ProfileLinksForm() {
  const {fields, append, remove} = useFieldArray<{links: ProfileLink[]}>({
    name: 'links',
  });
  return (
    <div>
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="mb-2.5 flex items-end gap-2.5">
            <HookForm.Field name={`links.${index}.url`} className="flex-auto">
              <Field.Label>
                <Trans message="URL" />
              </Field.Label>
              <Input required type="url" />
              <Field.Error />
            </HookForm.Field>
            <HookForm.Field name={`links.${index}.title`} className="flex-auto">
              <Field.Label>
                <Trans message="Short title" />
              </Field.Label>
              <Input required />
              <Field.Error />
            </HookForm.Field>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                remove(index);
              }}
            >
              <XIcon />
            </Button>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        color="primary"
        size="sm"
        onClick={() => {
          append({url: '', title: ''});
        }}
      >
        <PlusIcon />
        <Trans message="Add another link" />
      </Button>
    </div>
  );
}
