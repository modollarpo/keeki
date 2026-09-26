import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {useFormContext} from 'react-hook-form';

const contentTypeItems = [
  {
    value: 'listAll',
    label: <Trans message="List all content of specified type" />,
  },
  {
    value: 'manual',
    label: <Trans message="Manage content manually" />,
  },
  {
    value: 'autoUpdate',
    label: <Trans message="Automatically update content with specified method" />,
  },
];

interface Props {
  config: ChannelContentConfig;
  className?: string;
}
export function ContentTypeField({config, className}: Props) {
  const {setValue} = useFormContext<UpdateChannelPayload>();
  return (
    <HookForm.Field name="config.contentType" className={className}>
      <Field.Label>
        <Trans message="Content" />
      </Field.Label>
      <Select.Root
        items={contentTypeItems}
        onValueChange={newValue => {
          if (!newValue || typeof newValue !== 'string') return;
          // if content type is "auto update" select first model that
          // can be auto updated, otherwise select first available model
          let model = Object.entries(config.models)[0];
          if (newValue === 'autoUpdate') {
            const newModel = Object.entries(config.models).find(
              ([, modelConfig]) => modelConfig.autoUpdateMethods?.length,
            );
            if (newModel) {
              model = newModel;
            }
          }
          const [modelName, modelConfig] = model;

          setValue('config.contentModel', modelName);
          setValue('config.restrictionModelId', undefined);
          setValue(
            'config.autoUpdateMethod',
            newValue === 'autoUpdate' ? modelConfig.autoUpdateMethods?.[0] : '',
          );
          setValue('config.contentOrder', modelConfig.sortMethods[0]);
          (setValue as any)('config.restriction', null);
        }}
      >
        <Select.Trigger className="w-full">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {contentTypeItems.map(item => (
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
