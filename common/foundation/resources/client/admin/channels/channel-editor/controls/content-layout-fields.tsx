import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {ReactNode} from 'react';
import {useFormContext} from 'react-hook-form';

interface Props {
  config: ChannelContentConfig;
  className?: string;
}
export function ContentLayoutFields({config, className}: Props) {
  return (
    <div className={cn('items-end gap-3.5 md:flex', className)}>
      <LayoutField
        config={config}
        name="config.layout"
        label={<Trans message="Layout" />}
      />
      <LayoutField
        config={config}
        name="config.nestedLayout"
        label={<Trans message="Layout when nested" />}
      />
    </div>
  );
}

interface LayoutFieldProps extends Props {
  name: 'config.layout' | 'config.nestedLayout';
  label: ReactNode;
}
function LayoutField({config, name, label}: LayoutFieldProps) {
  const {watch} = useFormContext<UpdateChannelPayload>();
  const contentModel = watch('config.contentModel');
  const modelConfig = config.models[contentModel];

  if (!modelConfig.layoutMethods?.length) {
    return null;
  }

  const items = modelConfig.layoutMethods.map(method => ({
    value: method,
    label: <Trans {...config.layoutMethods[method].label} />,
  }));

  return (
    <HookForm.Field name={name} className="w-full flex-auto">
      <Field.Label>{label}</Field.Label>
      <Select.Root items={items}>
        <Select.Trigger className="w-full">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {items.map(item => (
            <Select.Item key={item.value} value={item.value}>
              {item.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Field.Error />
    </HookForm.Field>
  );
}
