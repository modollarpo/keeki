import {
  CreateChannelPayload,
  useCreateChannel,
} from '@common/admin/channels/requests/use-create-channel';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {EMPTY_PAGINATION_RESPONSE} from '@common/http/backend-response/pagination-response';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Button} from '@shadcn/button/button';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {ReactNode} from 'react';
import {useForm} from 'react-hook-form';

interface Props {
  defaultValues?: Partial<UpdateChannelPayload['config']>;
  children: ReactNode;
  submitButtonText?: ReactNode;
}
export function CreateChannelPageLayout({
  defaultValues,
  children,
  submitButtonText,
}: Props) {
  const form = useForm<CreateChannelPayload>({
    defaultValues: {
      content: EMPTY_PAGINATION_RESPONSE.pagination,
      config: {
        contentType: 'listAll',
        contentOrder: 'created_at:desc',
        nestedLayout: 'carousel',
        ...defaultValues,
      },
    },
  });
  const createChannel = useCreateChannel(form);

  return (
    <DashboardLayout.MainSection
      render={
        <HookForm.Root
          form={form}
          onSubmit={values => {
            createChannel.mutate(values);
          }}
        />
      }
    >
      <StaticPageTitle>
        <Trans message="New channel" />
      </StaticPageTitle>
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
            <Breadcrumb.Page>
              <Trans message="New" />
            </Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.Root>
        <Button
          variant="default"
          color="primary"
          type="submit"
          disabled={createChannel.isPending}
        >
          {submitButtonText ?? <Trans message="Save" />}
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
