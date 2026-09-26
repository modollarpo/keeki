import {channelQueries} from '@common/channels/channel-queries';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Select} from '@shadcn/forms/select/select';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {Link} from 'react-router';

type Props = {
  index: number;
};
export function ChannelSectionSettings({index}: Props) {
  const prefix =
    `client.landingPage.sections.${index}` as `client.landingPage.sections.${number}`;
  const query = useQuery(channelQueries.index());
  const channelItems = (query.data?.pagination?.data ?? []).map(channel => ({
    value: `${channel.id}`,
    label: channel.name,
  }));

  return (
    <Field.Group>
      <HookForm.Field name={`${prefix}.badge`}>
        <Field.Label>
          <Trans message="Badge" />
        </Field.Label>
        <Input />
        <Field.Error />
      </HookForm.Field>

      <HookForm.Field name={`${prefix}.title`}>
        <Field.Label>
          <Trans message="Title" />
        </Field.Label>
        <Input />
        <Field.Error />
      </HookForm.Field>

      <HookForm.Field name={`${prefix}.description`}>
        <Field.Label>
          <Trans message="Description" />
        </Field.Label>
        <Textarea rows={4} />
        <Field.Error />
      </HookForm.Field>

      <HookForm.Field name={`${prefix}.channelId`}>
        <Field.Label>
          <Trans message="Channel" />
        </Field.Label>
        <Select.Root items={channelItems}>
          <Select.Trigger className="w-full">
            <Select.Value placeholder={<Trans message="Select channel" />} />
          </Select.Trigger>
          <Select.Content>
            {channelItems.map(item => (
              <Select.Item key={item.value} value={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.Description>
          <Trans
            message="Configure channel content from <a>Channel manager</a>."
            values={{
              a: text => (
                <Link to="/admin/channels" target="_blank">
                  {text}
                </Link>
              ),
            }}
          />
        </Field.Description>
        <Field.Error />
      </HookForm.Field>
    </Field.Group>
  );
}
