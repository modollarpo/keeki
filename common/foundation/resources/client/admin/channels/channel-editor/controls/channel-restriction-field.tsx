import {AdminDocsUrls} from '@app/admin/admin-config';
import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {Button} from '@shadcn/button/button';
import {Field} from '@shadcn/forms/field';
import {Select} from '@shadcn/forms/select/select';
import {Popover} from '@shadcn/popover/popover';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {CircleQuestionMarkIcon} from 'lucide-react';
import {ReactElement} from 'react';
import {useFormContext} from 'react-hook-form';

interface Props {
  config: ChannelContentConfig;
  className?: string;
  children: ReactElement;
}
export function ChannelRestrictionField({config, className, children}: Props) {
  const {setValue, watch} = useFormContext<UpdateChannelPayload>();
  const modelConfig = config.models[watch('config.contentModel')];
  const contentType = watch('config.contentType');
  const restriction = watch('config.restriction');

  if (!modelConfig.restrictions || contentType === 'manual') {
    return null;
  }

  const items = [
    {
      value: '',
      label: <Trans message="Don't filter content" />,
    },
    ...Object.values(config.restrictions).map(r => ({
      value: r.value,
      label: <Trans {...r.label} />,
    })),
  ];

  return (
    <div className={cn('items-end gap-3.5 md:flex', className)}>
      <Field.Root name="config.restriction" className="w-full flex-auto">
        <Field.Label>
          <Trans message="Filter content by" />
          <InfoPopover />
        </Field.Label>
        <Select.Root
          items={items}
          value={restriction ?? ''}
          onValueChange={value => {
            setValue('config.restriction', value || null, {shouldDirty: true});
            setValue('config.restrictionModelId', 'urlParam', {
              shouldDirty: true,
            });
          }}
        >
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {items.map(item => (
              <Select.Item key={item.value || 'none'} value={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.Error />
      </Field.Root>
      {children}
    </div>
  );
}

function InfoPopover() {
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
        <Popover.Content className="w-80">
          <p className="prose prose-sm prose-neutral dark:prose-invert leading-snug text-pretty">
            <Trans message="Allows specifying additional condition channel content should be filtered on. " />
            <a
              href={`${AdminDocsUrls.pages.channels}#filter-content-by`}
              target="_blank"
            >
              <Trans message="Learn more" />
            </a>
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
