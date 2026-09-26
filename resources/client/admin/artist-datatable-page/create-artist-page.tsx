import {CrupdateArtistForm} from '@app/admin/artist-datatable-page/artist-form/crupdate-artist-form';
import {
  CreateArtistPayload,
  useCreateArtist,
} from '@app/admin/artist-datatable-page/requests/use-create-artist';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Button} from '@shadcn/button/button';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useForm} from 'react-hook-form';

export function Component() {
  const navigate = useNavigate();
  const form = useForm<CreateArtistPayload>();
  const createArtist = useCreateArtist(form);

  return (
    <DashboardLayout.MainSection
      render={
        <HookForm.Root
          form={form}
          onSubmit={values => {
            createArtist.mutate(values, {
              onSuccess: response => {
                navigate(`../${response.artist.id}/edit`, {
                  relative: 'path',
                  replace: true,
                });
              },
            });
          }}
        />
      }
    >
      <StaticPageTitle>
        <Trans message="New artist" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <Breadcrumb.Root className="text-xl">
          <Breadcrumb.Item>
            <Breadcrumb.Link to="/admin/artists">
              <Trans message="Artists" />
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
          disabled={createArtist.isPending}
        >
          <Trans message="Create" />
        </Button>
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          <CrupdateArtistForm showExternalFields />
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
    </DashboardLayout.MainSection>
  );
}
