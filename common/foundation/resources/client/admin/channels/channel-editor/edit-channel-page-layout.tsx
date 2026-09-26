import {
  UpdateChannelPayload,
  useUpdateChannel,
} from '@common/admin/channels/requests/use-update-channel';
import {useChannel} from '@common/channels/requests/use-channel';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Button} from '@shadcn/button/button';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {ReactNode} from 'react';
import {useForm, UseFormReturn} from 'react-hook-form';

interface Props {
  children: ReactNode;
}
export function EditChannelPageLayout({children}: Props) {
  const query = useChannel(undefined, 'editChannelPage');
  const channel = query.data.channel;
  const form = useForm<UpdateChannelPayload>({
    // @ts-ignore
    defaultValues: {
      ...channel,
    },
  }) as unknown as UseFormReturn<UpdateChannelPayload>;
  const updateChannel = useUpdateChannel(form);

  return (
    <DashboardLayout.MainSection
      render={
        <HookForm.Root
          form={form}
          onSubmit={values => {
            updateChannel.mutate(values);
          }}
        />
      }
    >
      <StaticPageTitle>{channel.name}</StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <Breadcrumb.Root className="text-xl">
          <Breadcrumb.Item>
            <Breadcrumb.Link to="/admin/channels">
              <Trans message="Channels" />
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>{channel.name}</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.Root>
        <Button
          variant="default"
          color="primary"
          type="submit"
          disabled={updateChannel.isPending}
        >
          <Trans message="Save" />
        </Button>
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          {children}
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
    </DashboardLayout.MainSection>
  );
}
