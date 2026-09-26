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
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {message} from '@ui/i18n/message';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {getLanguageList} from '@ui/utils/intl/languages';
import {useMemo, useState} from 'react';
import {useForm, useWatch} from 'react-hook-form';

interface MetadataProviderConfig {
  name: 'deezer' | 'spotify';
  label: MessageDescriptor;
  canBeMainProvider: boolean;
  credentials: {name: string; label: MessageDescriptor}[];
}

const AVAILABLE_METADATA_PROVIDERS: MetadataProviderConfig[] = [
  {
    name: 'deezer',
    label: message('Deezer'),
    canBeMainProvider: true,
    credentials: [],
  },
  {
    name: 'spotify',
    label: message('Spotify'),
    canBeMainProvider: true,
    credentials: [
      {name: 'spotify_id', label: message('Spotify ID')},
      {name: 'spotify_secret', label: message('Spotify secret')},
    ],
  },
] as const;

const metadataProviderOptions = [
  {value: 'local', label: <Trans message="Local database" />},
  ...AVAILABLE_METADATA_PROVIDERS.filter(
    provider => provider.canBeMainProvider,
  ).map(provider => ({
    value: provider.name,
    label: <Trans {...provider.label} />,
  })),
];

const artistBioProviderOptions = [
  {value: 'wikipedia', label: <Trans message="Wikipedia" />},
  {value: 'local', label: <Trans message="Local database" />},
];

const searchProviderOptions = [
  {
    value: 'external',
    label: <Trans message="Selected metadata provider" />,
  },
  {value: 'local', label: <Trans message="Local database" />},
  {
    value: 'local_and_external',
    label: <Trans message="Local and external" />,
  },
];

export function Component() {
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        metadata_provider: data.client.metadata_provider ?? 'none',
        search_provider: data.client.search_provider ?? 'local',
        artist_bio_provider: data.client.artist_bio_provider ?? 'local',
        wikipedia_language: data.client.wikipedia_language ?? 'en',
        player: {
          lyrics_automate: data.client.player?.lyrics_automate ?? false,
        },
      },
      server: {
        spotify_id: data.server.spotify_id ?? '',
        spotify_secret: data.server.spotify_secret ?? '',
      },
    },
  });

  return (
    <AdminSettingsLayout
      form={form}
      title={<Trans message="Content automation" />}
      docsLink={AdminDocsUrls.settings.automation}
    >
      <div className="flex flex-col gap-6">
        <MainProviderSection />
        <ArtistBiographySection />
        <SearchProviderSection />
        <LyricsAutomationSection />
      </div>
    </AdminSettingsLayout>
  );
}

function MainProviderSection() {
  const [originalProvider] = useState(
    () => getBootstrapData().settings.metadata_provider,
  );
  const selectedProvider = useWatch<AdminSettings, 'client.metadata_provider'>({
    name: 'client.metadata_provider',
  });
  const shouldWarnAboutProviderChange =
    originalProvider !== selectedProvider &&
    originalProvider !== 'local' &&
    selectedProvider !== 'local';
  return (
    <SettingsPanel
      title={<Trans message="Music metadata provider" />}
      description={
        <Trans message="Select which provider should be used for importing and updating data about artists, albums and tracks." />
      }
    >
      <Field.Group>
        <HookForm.Field name="client.metadata_provider">
          <Field.Label>
            <Trans message="Selected provider" />
          </Field.Label>
          <Select.Root items={metadataProviderOptions}>
            <Select.Trigger className="w-full">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {metadataProviderOptions.map(option => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Field.Error />
        </HookForm.Field>
        <ProviderCredentialFields providerName={selectedProvider ?? 'none'} />
        {shouldWarnAboutProviderChange && (
          <Alert.Root variant="destructive" fillStyle="subtleFill">
            <Alert.Description>
              <Trans message="Changing from one external provider to another can result in duplicate artists, albums or tracks being imported." />
            </Alert.Description>
          </Alert.Root>
        )}
      </Field.Group>
    </SettingsPanel>
  );
}

type ProviderCredentialFieldsProps = {
  providerName: string;
};
function ProviderCredentialFields({
  providerName,
}: ProviderCredentialFieldsProps) {
  if (providerName === 'spotify') {
    return (
      <div className="flex items-center gap-3">
        <HookForm.Field name="server.spotify_id" className="flex-1">
          <Field.Label>
            <Trans message="Spotify ID" />
          </Field.Label>
          <Input required />
          <Field.Error />
        </HookForm.Field>
        <HookForm.Field name="server.spotify_secret" className="flex-1">
          <Field.Label>
            <Trans message="Spotify secret" />
          </Field.Label>
          <Input required />
          <Field.Error />
        </HookForm.Field>
      </div>
    );
  }
}

function ArtistBiographySection() {
  const languages = useMemo(
    () =>
      getLanguageList().map(language => ({
        value: language.code,
        label: language.name,
      })),
    [],
  );
  const selectedProvider = useWatch<
    AdminSettings,
    'client.artist_bio_provider'
  >({
    name: 'client.artist_bio_provider',
  });
  return (
    <SettingsPanel
      title={<Trans message="Artist biography provider" />}
      description={
        <Trans message="Configure where artist biographies are fetched from." />
      }
    >
      <div className="flex gap-3">
        <HookForm.Field name="client.artist_bio_provider" className="flex-1">
          <Field.Label className="sr-only">
            <Trans message="Artist biography provider" />
          </Field.Label>
          <Select.Root items={artistBioProviderOptions}>
            <Select.Trigger className="w-full">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {artistBioProviderOptions.map(option => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Field.Error />
        </HookForm.Field>
        {selectedProvider === 'wikipedia' && (
          <HookForm.Field name="client.wikipedia_language" className="flex-1">
            <Field.Label className="sr-only">
              <Trans message="Language" />
            </Field.Label>
            <Select.Root items={languages}>
              <Select.Trigger className="w-full">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {languages.map(language => (
                  <Select.Item key={language.value} value={language.value}>
                    {language.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Field.Error />
          </HookForm.Field>
        )}
      </div>
    </SettingsPanel>
  );
}

function SearchProviderSection() {
  return (
    <SettingsPanel
      title={<Trans message="Search method" />}
      description={
        <Trans message="Configure which method should be used for user facing search in the web player." />
      }
    >
      <HookForm.Field name="client.search_provider">
        <Field.Label className="sr-only">
          <Trans message="Search method" />
        </Field.Label>
        <Select.Root items={searchProviderOptions}>
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {searchProviderOptions.map(option => (
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

function LyricsAutomationSection() {
  return (
    <SettingsPanel
      title={<Trans message="Lyrics Automation" />}
      description={
        <Trans message="Try to automatically find and import lyrics based on song and artist name. Lyrics can still be added manually, if this is disabled." />
      }
    >
      <HookForm.Field name="client.player.lyrics_automate">
        <Field.Label>
          <Switch />
          <Trans message="Enable lyrics automation" />
        </Field.Label>
      </HookForm.Field>
    </SettingsPanel>
  );
}
