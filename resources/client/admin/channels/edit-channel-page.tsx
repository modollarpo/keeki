import {AppChannelAutoUpdateField} from '@app/admin/channels/app-channel-auto-update-field';
import {AppChannelRestrictionField} from '@app/admin/channels/app-channel-restriction-field';
import {channelContentConfig} from '@app/admin/channels/channel-content-config';
import {ChannelContentItemImage} from '@app/admin/channels/channel-content-item-image';
import {ChannelContentEditor} from '@common/admin/channels/channel-editor/channel-content-editor';
import {
  ChannelContentSearchField,
  ChannelContentSearchFieldProps,
} from '@common/admin/channels/channel-editor/channel-content-search-field';
import {ChannelNameField} from '@common/admin/channels/channel-editor/controls/channel-name-field';
import {ChannelPaginationTypeField} from '@common/admin/channels/channel-editor/controls/channel-pagination-type-field';
import {ChannelSeoFields} from '@common/admin/channels/channel-editor/controls/channel-seo-fields';
import {ContentLayoutFields} from '@common/admin/channels/channel-editor/controls/content-layout-fields';
import {ContentModelField} from '@common/admin/channels/channel-editor/controls/content-model-field';
import {ContentOrderField} from '@common/admin/channels/channel-editor/controls/content-order-field';
import {ContentTypeField} from '@common/admin/channels/channel-editor/controls/content-type-field';
import {EditChannelPageLayout} from '@common/admin/channels/channel-editor/edit-channel-page-layout';
import {Accordion} from '@shadcn/accordion/accordion';
import {Button} from '@shadcn/button/button';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Switch} from '@shadcn/forms/switch/switch';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {Popover} from '@shadcn/popover/popover';
import {Trans} from '@ui/i18n/trans';
import {
  CircleQuestionMarkIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  TextAlignEndIcon,
} from 'lucide-react';
import {Fragment} from 'react';

export function Component() {
  return (
    <EditChannelPageLayout>
      <Fragment>
        <Accordion.Root variant="separated" multiple>
          <Accordion.Item value="title">
            <Accordion.Trigger>
              <TextAlignEndIcon />
              <Trans message="Title & description" />
            </Accordion.Trigger>
            <Accordion.Content>
              <Field.Group>
                <ChannelNameField />
                <HookForm.Field name="config.hideTitle">
                  <Field.Label>
                    <Switch />
                    <Trans message="Hide title" />
                  </Field.Label>
                  <Field.Description>
                    <Trans message="Whether title should be shown when displaying this channel on the site." />
                  </Field.Description>
                  <Field.Error />
                </HookForm.Field>
                <HookForm.Field name="description">
                  <Field.Label>
                    <Trans message="Description" />
                  </Field.Label>
                  <Textarea rows={1} />
                  <Field.Error />
                </HookForm.Field>
                <HookForm.Field name="config.adminDescription">
                  <Field.Label className="gap-1">
                    <Trans message="Internal description" />
                    <InfoPopover
                      body={
                        <Trans message="This describes the purpose of the channel and is only visible in admin area." />
                      }
                    />
                  </Field.Label>
                  <Textarea />
                  <Field.Error />
                </HookForm.Field>
              </Field.Group>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="content">
            <Accordion.Trigger>
              <SettingsIcon />
              <Trans message="Content settings" />
            </Accordion.Trigger>
            <Accordion.Content>
              <Field.Group>
                <ContentTypeField config={channelContentConfig} />
                <AppChannelAutoUpdateField config={channelContentConfig} />
                <ContentModelField config={channelContentConfig} />
                <AppChannelRestrictionField config={channelContentConfig} />
                <ContentOrderField config={channelContentConfig} />
              </Field.Group>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="layout">
            <Accordion.Trigger>
              <LayoutDashboardIcon />
              <Trans message="Layout" />
            </Accordion.Trigger>
            <Accordion.Content>
              <Field.Group>
                <ContentLayoutFields config={channelContentConfig} />
                <ChannelPaginationTypeField config={channelContentConfig} />
              </Field.Group>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="seo">
            <Accordion.Trigger>
              <GlobeIcon />
              <Trans message="SEO" />
            </Accordion.Trigger>
            <Accordion.Content>
              <Field.Group>
                <ChannelSeoFields />
              </Field.Group>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
        <ChannelContentEditor searchField={<SearchField />} />
      </Fragment>
    </EditChannelPageLayout>
  );
}

function SearchField(props: ChannelContentSearchFieldProps) {
  return (
    <ChannelContentSearchField
      {...props}
      imgRenderer={item => <ChannelContentItemImage item={item} />}
    />
  );
}

function InfoPopover({body}: {body: React.ReactNode}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
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
        <Popover.Content className="w-72">{body}</Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
