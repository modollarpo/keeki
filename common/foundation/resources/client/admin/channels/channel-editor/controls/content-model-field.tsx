import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {useFormContext} from 'react-hook-form';

interface Props {
  config: ChannelContentConfig;
  className?: string;
  exclude?: string[];
}
export function ContentModelField({config, className, exclude}: Props) {
  const {setValue, getValues} = useFormContext<UpdateChannelPayload>();

  const items = Object.entries(config.models)
    .filter(([model]) => !exclude?.includes(model))
    .map(([model, {label}]) => ({
      value: model,
      label: <Trans {...label} />,
    }));

  return (
    <HookForm.Field name="config.contentModel" className={className}>
      <Field.Label>
        <Trans message="Type of content" />
      </Field.Label>
      <Select.Root
        items={items}
        onValueChange={newValue => {
          if (!newValue || typeof newValue !== 'string') return;
          const modelConfig = config.models[newValue];
          if (
            getValues('config.contentType') === 'autoUpdate' &&
            !modelConfig.autoUpdateMethods?.length
          ) {
            (setValue as any)('config.contentType', 'manual');
          }

          // sync auto update config
          const firstAutoUpdateMethod = modelConfig.autoUpdateMethods?.[0];
          setValue('config.autoUpdateMethod', firstAutoUpdateMethod);
          setValue(
            'config.autoUpdateProvider',
            firstAutoUpdateMethod
              ? config.autoUpdateMethods[firstAutoUpdateMethod]?.providers[0]
              : undefined,
          );

          // sync restrictions
          setValue('config.restriction', null);
          setValue('config.restrictionModelId', null);

          // sync order
          setValue(
            'config.contentOrder',
            modelConfig.sortMethods[0] || 'channelables.order:asc',
          );

          // sync layout
          setValue('config.layout', modelConfig.layoutMethods[0]);
        }}
      >
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
