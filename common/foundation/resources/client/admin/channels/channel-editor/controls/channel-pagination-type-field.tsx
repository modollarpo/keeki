import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';

const paginationTypeItems = [
  {
    value: 'infiniteScroll',
    label: <Trans message="Infinite scroll" />,
  },
  {
    value: 'lengthAware',
    label: <Trans message="List of page buttons" />,
  },
  {
    value: 'simple',
    label: <Trans message="Next/previous page buttons only" />,
  },
];

interface Props {
  config: ChannelContentConfig;
  className?: string;
}
export function ChannelPaginationTypeField({className}: Props) {
  return (
    <HookForm.Field name="config.paginationType" className={className}>
      <Field.Label>
        <Trans message="Pagination type" />
      </Field.Label>
      <Select.Root items={paginationTypeItems}>
        <Select.Trigger className="w-full">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {paginationTypeItems.map(item => (
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
