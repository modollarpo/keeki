import {AdminDocsUrls} from '@app/admin/admin-config';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {AdminSettingsLayout} from '@common/admin/settings/layout/settings-layout';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {useAdminSettings} from '@common/admin/settings/use-admin-settings';
import {Alert} from '@shadcn/alert/alert';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Select} from '@shadcn/forms/select/select';
import {Switch} from '@shadcn/forms/switch/switch';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {ReactElement} from 'react';
import {useForm} from 'react-hook-form';

type Props = {
  tabs: ReactElement;
  title: ReactElement<MessageDescriptor>;
};

const popularitySourceOptions = [
  {value: 'external', label: <Trans message="External popularity" />},
  {value: 'local', label: <Trans message="Local plays" />},
] as const;

const seekbarTypeOptions = [
  {value: 'waveform', label: <Trans message="Waveform" />},
  {value: 'line', label: <Trans message="Simple" />},
] as const;

export function FunctionalitySettings({tabs, title}: Props) {
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        player: {
          sort_method: data.client.player?.sort_method ?? 'external',
          default_volume: data.client.player?.default_volume ?? 100,
          seekbar_type: data.client.player?.seekbar_type ?? 'waveform',
          enable_repost: data.client.player?.enable_repost ?? false,
          track_comments: data.client.player?.track_comments ?? false,
          show_upload_btn: data.client.player?.show_upload_btn ?? false,
          show_become_artist_btn:
            data.client.player?.show_become_artist_btn ?? false,
          enable_offlining: data.client.player?.enable_offlining ?? false,
        },
        uploads: {
          autoMatch: data.client.uploads?.autoMatch ?? false,
        },
      },
    },
  });
  return (
    <AdminSettingsLayout form={form} title={title} tabs={tabs}>
      <div className="flex flex-col gap-6">
        <ContentPopularitySection />
        <VolumeSettingsPanel />
        <SeekbarSection />
        <SocialFeaturesSection />
        <OfflineFunctionalitySection />
        <NavigationAccessSection />
        <ContentManagementSection />
      </div>
    </AdminSettingsLayout>
  );
}

export function ContentPopularitySection() {
  return (
    <SettingsPanel
      title={<Trans message="Content Popularity" />}
      description={
        <Trans message="When content is sorted by popularity (e.g. in track tables), choose whether to use external popularity or local play counts." />
      }
    >
      <HookForm.Field name="client.player.sort_method">
        <Field.Label>
          <Trans message="Popularity source" />
        </Field.Label>
        <Select.Root items={popularitySourceOptions}>
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {popularitySourceOptions.map(option => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.Error />
      </HookForm.Field>
    </SettingsPanel>
  );
}

function VolumeSettingsPanel() {
  return (
    <SettingsPanel
      title={<Trans message="Volume Settings" />}
      description={
        <Trans message="Configure default audio volume and playback settings." />
      }
    >
      <HookForm.Field name="client.player.default_volume">
        <Field.Label>
          <Trans message="Default player volume" />
        </Field.Label>
        <Input type="number" min={1} max={100} />
        <Field.Description>
          <Trans message="Set the default volume level (1-100) when the player loads." />
        </Field.Description>
        <Field.Error />
      </HookForm.Field>
    </SettingsPanel>
  );
}

export function SeekbarSection() {
  return (
    <SettingsPanel
      title={<Trans message="Player Seekbar" />}
      description={
        <Trans message="Choose between waveform visualization or simple line seekbar." />
      }
    >
      <HookForm.Field name="client.player.seekbar_type">
        <Field.Label>
          <Trans message="Seekbar type" />
        </Field.Label>
        <Select.Root items={seekbarTypeOptions}>
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {seekbarTypeOptions.map(option => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.Error />
      </HookForm.Field>
      <Alert.Root className="mt-3" variant="warning" fillStyle="subtleFill">
        <Alert.Description className="text-xs">
          <Trans message="Waveforms are generated during upload and will default to simple for auto-imported tracks." />
        </Alert.Description>
      </Alert.Root>
    </SettingsPanel>
  );
}

export function SocialFeaturesSection() {
  return (
    <SettingsPanel
      title={<Trans message="Social Features" />}
      description={
        <Trans message="Enable or disable social interaction features for tracks and albums." />
      }
    >
      <Field.Group>
        <HookForm.Field name="client.player.enable_repost">
          <Field.Label>
            <Switch />
            <Trans message="Enable reposts" />
          </Field.Label>
          <Field.Description>
            <Trans message="Allow users to repost albums and tracks to share them with their followers." />
          </Field.Description>
        </HookForm.Field>
        <HookForm.Field name="client.player.track_comments">
          <Field.Label>
            <Switch />
            <Trans message="Enable commenting" />
          </Field.Label>
          <Field.Description>
            <Trans message="Allow users to leave comments on albums and tracks." />
          </Field.Description>
        </HookForm.Field>
      </Field.Group>
    </SettingsPanel>
  );
}

export function OfflineFunctionalitySection() {
  return (
    <SettingsPanel
      title={<Trans message="Offline playback" />}
      description={
        <Trans message="Control whether users can make music available for offline listening." />
      }
    >
      <HookForm.Field name="client.player.enable_offlining">
        <Field.Label>
          <Switch />
          <Trans message="Enable offline playback functionality" />
        </Field.Label>
      </HookForm.Field>
      <Alert.Root className="mt-3" variant="warning" fillStyle="subtleFill">
        <Alert.Description className="text-xs">
          <Trans message="Does not work for tracks with youtube as the only playback source." />
        </Alert.Description>
      </Alert.Root>
    </SettingsPanel>
  );
}

export function NavigationAccessSection() {
  return (
    <SettingsPanel
      title={<Trans message="Navigation & Access" />}
      description={
        <Trans message="Control which navigation elements and access points are visible to users." />
      }
    >
      <Field.Group>
        <HookForm.Field name="client.player.show_upload_btn">
          <Field.Label>
            <Switch />
            <Trans message="Show upload button" />
          </Field.Label>
          <Field.Description>
            <Trans message="Show upload button in the left sidebar for users with upload permissions." />
          </Field.Description>
        </HookForm.Field>
        <HookForm.Field name="client.player.show_become_artist_btn">
          <Field.Label>
            <Switch />
            <Trans message="Show become artist menu" />
          </Field.Label>
          <Field.Description>
            <Trans
              message="Show <a>Become artist</a> menu item for users who are not yet artists."
              values={{
                a: parts => (
                  <a target="_blank" href={AdminDocsUrls.pages.backstage}>
                    {parts}
                  </a>
                ),
              }}
            />
          </Field.Description>
        </HookForm.Field>
      </Field.Group>
    </SettingsPanel>
  );
}

export function ContentManagementSection() {
  return (
    <SettingsPanel
      title={<Trans message="Content Management" />}
      description={
        <Trans message="Configure how uploaded content is processed and matched with existing data." />
      }
    >
      <HookForm.Field name="client.uploads.autoMatch">
        <Field.Label>
          <Switch />
          <Trans message="Enable metadata matching" />
        </Field.Label>
        <Field.Description>
          <Trans message="Automatically match uploaded files with existing albums and artists based on metadata, or create new entries if they don't exist." />
        </Field.Description>
      </HookForm.Field>
    </SettingsPanel>
  );
}
