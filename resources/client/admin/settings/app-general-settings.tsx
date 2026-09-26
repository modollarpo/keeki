import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {Component as CommonGeneralSettings} from '@common/admin/settings/pages/general-settings';
import {useAdminSettings} from '@common/admin/settings/use-admin-settings';
import {useValueLists} from '@common/http/value-lists';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {useWatch} from 'react-hook-form';

const homepageTypeOptions = [
  {value: 'channel', label: <Trans message="Channel" />},
  {value: 'landingPage', label: <Trans message="Landing page" />},
  {value: 'loginPage', label: <Trans message="Login page" />},
] as const;

export function Component() {
  const {data} = useAdminSettings();
  return (
    <CommonGeneralSettings
      defaultValues={{
        client: {
          homepage: {
            type: data?.client?.homepage?.type,
            value: data?.client?.homepage?.value,
          },
        },
      }}
    >
      <HomepageSection />
    </CommonGeneralSettings>
  );
}

function HomepageSection() {
  const {data} = useValueLists(['menuItemCategories']);
  const selectedType = useWatch({name: 'client.homepage.type'});
  const channels =
    data?.menuItemCategories
      ?.find(category => category.type === 'channel')
      ?.items.map(channel => ({
        value: `${channel.id}`,
        label: channel.label,
      })) ?? [];

  return (
    <SettingsPanel
      className="mb-6"
      title={<Trans message="Homepage" />}
      description={
        <Trans message="Configure which page should be displayed as your site's homepage." />
      }
    >
      <HookForm.Field name="client.homepage.type">
        <Field.Label>
          <Trans message="Site home page" />
        </Field.Label>
        <Select.Root items={homepageTypeOptions}>
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {homepageTypeOptions.map(option => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.Error />
      </HookForm.Field>
      {selectedType === 'channel' && (
        <HookForm.Field name="client.homepage.value" className="mt-5">
          <Field.Label>
            <Trans message="Channel" />
          </Field.Label>
          <Select.Root items={channels}>
            <Select.Trigger className="w-full">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {channels.map(channel => (
                <Select.Item key={channel.value} value={channel.value}>
                  {channel.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Field.Error />
        </HookForm.Field>
      )}
    </SettingsPanel>
  );
}
