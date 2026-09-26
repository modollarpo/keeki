import {
  getSectionDefinition,
  sectionAlignOptions,
  sectionBackgroundOptions,
  sectionSpacingOptions,
} from '@common/ui/landing-page/section-defs';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {ReactNode, useWatch} from 'react-hook-form';

type SectionPresentationSettingsProps = {
  prefix: string;
};

/**
 * Shared "Appearance" panel: variant, background, spacing and alignment controls.
 * The controls are rendered straight from the section registry so the available
 * variants always match what the renderers support, and sections with a single
 * variant simply hide the picker.
 */
export function SectionPresentationSettings({
  prefix,
}: SectionPresentationSettingsProps) {
  const name = useWatch({name: `${prefix}.name`}) as string;
  const def = getSectionDefinition(name);
  if (!def) {
    return null;
  }

  const showVariant = def.variants.length > 1;

  return (
    <div className="flex flex-col gap-2">
      <Field.Separator />
      <Field.Title>
        <Trans message="Appearance" />
      </Field.Title>
      {showVariant ? (
        <PresentationSelect
          prefix={prefix}
          field="variant"
          label={<Trans message="Variant" />}
          options={def.variants.map(variant => ({
            value: variant.value,
            label: variant.label,
          }))}
        />
      ) : null}
      <PresentationSelect
        prefix={prefix}
        field="background"
        label={<Trans message="Background" />}
        options={Object.entries(sectionBackgroundOptions).map(
          ([value, label]) => ({value, label}),
        )}
      />
      <PresentationSelect
        prefix={prefix}
        field="spacing"
        label={<Trans message="Spacing" />}
        options={Object.entries(sectionSpacingOptions).map(
          ([value, label]) => ({value, label}),
        )}
      />
      {def.allowAlign ? (
        <PresentationSelect
          prefix={prefix}
          field="align"
          label={<Trans message="Alignment" />}
          options={Object.entries(sectionAlignOptions).map(
            ([value, label]) => ({value, label}),
          )}
        />
      ) : null}
    </div>
  );
}

type PresentationSelectProps = {
  prefix: string;
  field: string;
  label: ReactNode;
  options: {value: string; label: ReactNode}[];
};
function PresentationSelect({
  prefix,
  field,
  label,
  options,
}: PresentationSelectProps) {
  return (
    <HookForm.Field name={`${prefix}.${field}`}>
      <Field.Label>{label}</Field.Label>
      <Select.Root items={options}>
        <Select.Trigger className="w-full">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {options.map(option => (
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