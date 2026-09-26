import {AppChannelAutoUpdateField} from '@app/admin/channels/app-channel-auto-update-field';
import {AppChannelRestrictionField} from '@app/admin/channels/app-channel-restriction-field';
import {channelContentConfig} from '@app/admin/channels/channel-content-config';
import {TRACK_MODEL} from '@app/web-player/tracks/track';
import {ChannelEditorTabs} from '@common/admin/channels/channel-editor/channel-editor-tabs';
import {ChannelNameField} from '@common/admin/channels/channel-editor/controls/channel-name-field';
import {ContentLayoutFields} from '@common/admin/channels/channel-editor/controls/content-layout-fields';
import {ContentModelField} from '@common/admin/channels/channel-editor/controls/content-model-field';
import {ContentOrderField} from '@common/admin/channels/channel-editor/controls/content-order-field';
import {ContentTypeField} from '@common/admin/channels/channel-editor/controls/content-type-field';
import {CreateChannelPageLayout} from '@common/admin/channels/channel-editor/create-channel-page-layout';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Switch} from '@shadcn/forms/switch/switch';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {Trans} from '@ui/i18n/trans';

export function Component() {
  return (
    <CreateChannelPageLayout
      defaultValues={{
        contentType: 'listAll',
        contentModel: TRACK_MODEL,
        contentOrder: 'created_at:desc',
        layout: 'trackTable',
        nestedLayout: 'carousel',
        paginationType: 'infiniteScroll',
      }}
    >
      <ChannelEditorTabs>
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
            <Textarea rows={2} />
            <Field.Error />
          </HookForm.Field>
          <ContentTypeField config={channelContentConfig} />
          <AppChannelAutoUpdateField config={channelContentConfig} />
          <ContentModelField config={channelContentConfig} />
          <AppChannelRestrictionField config={channelContentConfig} />
          <ContentOrderField config={channelContentConfig} />
          <ContentLayoutFields config={channelContentConfig} />
        </Field.Group>
      </ChannelEditorTabs>
    </CreateChannelPageLayout>
  );
}
