import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';

const roleOptions = [
  {value: 'artist', label: <Trans message="Artist" />},
  {value: 'agent', label: <Trans message="Agent" />},
  {value: 'composer', label: <Trans message="Composer" />},
  {value: 'label', label: <Trans message="Label" />},
  {value: 'manager', label: <Trans message="Manager" />},
  {value: 'musician', label: <Trans message="Musician" />},
  {value: 'producer', label: <Trans message="Producer" />},
  {value: 'publisher', label: <Trans message="Publisher" />},
  {value: 'songwriter', label: <Trans message="Songwriter" />},
] as const;

export function BackstageRoleSelect() {
  return (
    <HookForm.Field name="role">
      <Field.Label>
        <Trans message="Role" />
      </Field.Label>
      <Select.Root items={roleOptions}>
        <Select.Trigger className="w-full">
          <Select.Value placeholder={<Trans message="Select a role" />} />
        </Select.Trigger>
        <Select.Content>
          {roleOptions.map(option => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Field.Error />
    </HookForm.Field>
  );
}
