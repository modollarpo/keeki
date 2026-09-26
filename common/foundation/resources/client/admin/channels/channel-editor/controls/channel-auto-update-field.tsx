import {AdminDocsUrls} from '@app/admin/admin-config';
import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {Button} from '@shadcn/button/button';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Select} from '@shadcn/forms/select/select';
import {Popover} from '@shadcn/popover/popover';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {CircleQuestionMarkIcon} from 'lucide-react';
import {useFormContext} from 'react-hook-form';

interface AutoUpdateProvider {
  label: MessageDescriptor;
  value: string;
}

interface Props {
  config: ChannelContentConfig;
  className?: string;
  providers?: AutoUpdateProvider[];
}
export function ChannelAutoUpdateField({config, className, providers}: Props) {
  const {watch, setValue} = useFormContext<UpdateChannelPayload>();
  const modelConfig = config.models[watch('config.contentModel')];
  const selectedMethodConfig =
    config.autoUpdateMethods[watch('config.autoUpdateMethod')!];

  if (
    watch('config.contentType') !== 'autoUpdate' ||
    !modelConfig.autoUpdateMethods?.length
  ) {
    return null;
  }

  const methodItems = modelConfig.autoUpdateMethods.map(method => ({
    value: method,
    label: <Trans {...config.autoUpdateMethods[method].label} />,
  }));

  const providerItems =
    providers
      ?.filter(p => selectedMethodConfig?.providers.includes(p.value))
      .map(provider => ({
        value: provider.value,
        label: <Trans {...provider.label} />,
      })) ?? [];

  return (
    <div className={cn('items-end gap-3.5 md:flex', className)}>
      <HookForm.Field name="config.autoUpdateMethod" className="flex-auto">
        <Field.Label>
          <Trans message="Auto update method" />
          <InfoPopover
            body={
              <p className="prose prose-sm prose-neutral dark:prose-invert leading-snug text-pretty">
                <Trans message="This option will automatically update channel content every 24 hours using the specified method." />{' '}
                <a
                  href={`${AdminDocsUrls.pages.channels}#automatically-update-content-with-specified-method`}
                  target="_blank"
                >
                  <Trans message="Learn more" />
                </a>
              </p>
            }
          />
        </Field.Label>
        <Select.Root
          items={methodItems}
          required
          onValueChange={value => {
            if (!value || typeof value !== 'string') return;
            setValue(
              'config.autoUpdateProvider',
              config.autoUpdateMethods[value].providers[0],
            );
          }}
        >
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {methodItems.map(item => (
              <Select.Item key={item.value} value={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.Error />
      </HookForm.Field>
      {selectedMethodConfig?.value ? (
        <HookForm.Field name="config.autoUpdateValue" className="flex-auto">
          <Field.Label>
            <Trans {...selectedMethodConfig?.value.label} />
          </Field.Label>
          <Input required type={selectedMethodConfig?.value.inputType} />
          <Field.Error />
        </HookForm.Field>
      ) : null}
      {providerItems.length ? (
        <HookForm.Field
          name="config.autoUpdateProvider"
          className="mt-6 flex-auto md:mt-0"
        >
          <Field.Label>
            <Trans message="Fetch content from" />
          </Field.Label>
          <Select.Root items={providerItems} required>
            <Select.Trigger className="w-full">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {providerItems.map(item => (
                <Select.Item key={item.value} value={item.value}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Field.Error />
        </HookForm.Field>
      ) : null}
    </div>
  );
}

function InfoPopover({body}: {body: React.ReactNode}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            className="text-muted-foreground opacity-70"
          />
        }
      >
        <CircleQuestionMarkIcon className="size-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="w-80">{body}</Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
