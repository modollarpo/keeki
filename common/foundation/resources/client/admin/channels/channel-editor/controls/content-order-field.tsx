import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {ReactNode} from 'react';
import {useFormContext} from 'react-hook-form';

interface Props {
  config: ChannelContentConfig;
  className?: string;
}
export function ContentOrderField({config, className}: Props) {
  const {watch} = useFormContext<UpdateChannelPayload>();
  const contentType = watch('config.contentType');
  const modelConfig = config.models[watch('config.contentModel')];
  const sortMethods = [
    ...modelConfig.sortMethods,
    'channelables.order:asc',
    'channelables.created_at:desc',
  ];

  const items = sortMethods
    .map(method => {
      const sortConfig = config.sortingMethods[method];
      if (
        !sortConfig.contentTypes ||
        sortConfig.contentTypes.includes(contentType)
      ) {
        return {
          value: method,
          label: <Trans {...sortConfig.label} />,
        };
      }
      return null;
    })
    .filter(Boolean) as {value: string; label: ReactNode}[];

  return (
    <HookForm.Field name="config.contentOrder" className={className}>
      <Field.Label>
        <Trans message="How to order content" />
      </Field.Label>
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
