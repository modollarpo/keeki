import {AdminSettings} from '@common/admin/settings/admin-settings';
import {AdminSettingsLayout} from '@common/admin/settings/layout/settings-layout';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {useAdminSettings} from '@common/admin/settings/use-admin-settings';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Switch} from '@shadcn/forms/switch/switch';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {ReactElement} from 'react';
import {useForm} from 'react-hook-form';

type Props = {
  tabs: ReactElement;
  title: ReactElement<MessageDescriptor>;
};

export function InterfaceSettings({tabs, title}: Props) {
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        player: {
          hide_lyrics: data.client.player?.hide_lyrics ?? false,
          hide_queue: data.client.player?.hide_queue ?? false,
          hide_radio_button: data.client.player?.hide_radio_button ?? false,
          enable_download: data.client.player?.enable_download ?? false,
          hide_video_button: data.client.player?.hide_video_button ?? false,
          hide_video: data.client.player?.hide_video ?? false,
          mobile: {
            auto_open_overlay:
              data.client.player?.mobile?.auto_open_overlay ?? false,
          },
        },
      },
    },
  });
  return (
    <AdminSettingsLayout form={form} title={title} tabs={tabs}>
      <div className="flex flex-col gap-6">
        <LyricsSettingsPanel />
        <RadioSettingsPanel />
        <QueueSettingsPanel />
        <DownloadSettingsPanel />
        <VideoControlsPanel />
        <MobileSettingsPanel />
      </div>
    </AdminSettingsLayout>
  );
}

function LyricsSettingsPanel() {
  return (
    <SettingsPanel
      title={<Trans message="Lyrics" />}
      description={
        <Trans message="Hide the lyrics button from player controls." />
      }
    >
      <HookForm.Field name="client.player.hide_lyrics">
        <Field.Label>
          <Switch />
          <Trans message="Hide lyrics button" />
        </Field.Label>
      </HookForm.Field>
    </SettingsPanel>
  );
}

function QueueSettingsPanel() {
  return (
    <SettingsPanel
      title={<Trans message="Queue" />}
      description={
        <Trans message="Hide the player queue sidebar by default. Users can still toggle it using the queue button." />
      }
    >
      <HookForm.Field name="client.player.hide_queue">
        <Field.Label>
          <Switch />
          <Trans message="Hide queue sidebar" />
        </Field.Label>
      </HookForm.Field>
    </SettingsPanel>
  );
}

function RadioSettingsPanel() {
  return (
    <SettingsPanel
      title={<Trans message="Radio" />}
      description={
        <Trans message="Hide 'Go to radio' buttons throughout the application." />
      }
    >
      <HookForm.Field name="client.player.hide_radio_button">
        <Field.Label>
          <Switch />
          <Trans message="Hide radio buttons" />
        </Field.Label>
      </HookForm.Field>
    </SettingsPanel>
  );
}

function DownloadSettingsPanel() {
  return (
    <SettingsPanel
      title={<Trans message="Downloads" />}
      description={
        <Trans message="Show download button in player controls. Only appears if track has an audio or video file uploaded." />
      }
    >
      <HookForm.Field name="client.player.enable_download">
        <Field.Label>
          <Switch />
          <Trans message="Enable download button" />
        </Field.Label>
      </HookForm.Field>
    </SettingsPanel>
  );
}

function VideoControlsPanel() {
  return (
    <SettingsPanel
      title={<Trans message="Video Controls" />}
      description={
        <Trans message="Configure video player visibility and control buttons." />
      }
    >
      <Field.Group>
        <HookForm.Field name="client.player.hide_video_button">
          <Field.Label>
            <Switch />
            <Trans message="Hide fullscreen button" />
          </Field.Label>
          <Field.Description>
            <Trans message="Hide toggle fullscreen button from player controls." />
          </Field.Description>
        </HookForm.Field>

        <HookForm.Field name="client.player.hide_video">
          <Field.Label>
            <Switch />
            <Trans message="Hide video player" />
          </Field.Label>
          <Field.Description>
            <Trans message="Hide the small video player in the bottom right corner by default. Note: This may cause background playback issues with YouTube embeds, especially on mobile." />
          </Field.Description>
        </HookForm.Field>
      </Field.Group>
    </SettingsPanel>
  );
}

function MobileSettingsPanel() {
  return (
    <SettingsPanel
      title={<Trans message="Mobile Settings" />}
      description={
        <Trans message="Configure mobile-specific player behavior and experience." />
      }
    >
      <HookForm.Field name="client.player.mobile.auto_open_overlay">
        <Field.Label>
          <Switch />
          <Trans message="Auto-open overlay on mobile" />
        </Field.Label>
        <Field.Description>
          <Trans message="Automatically open fullscreen video overlay on mobile when playback starts. Only applies to YouTube streaming." />
        </Field.Description>
      </HookForm.Field>
    </SettingsPanel>
  );
}
