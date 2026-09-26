import {TrackForm} from '@app/admin/tracks-datatable-page/track-form/track-form';
import {
  CreateTrackPayload,
  CreateTrackResponse,
  useCreateTrack,
} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {
  FileUploadProvider,
  useFileUploadStore,
} from '@common/uploads/uploader/file-upload-provider';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Button} from '@shadcn/button/button';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useForm} from 'react-hook-form';
import {useLocation} from 'react-router';

export function Component() {
  return (
    <FileUploadProvider>
      <CreateTrackPage />
    </FileUploadProvider>
  );
}

function CreateTrackPage() {
  const page = useCreateTrackPage();
  const {form, createTrack, uploadIsInProgress, handleSuccess} = page;

  return (
    <DashboardLayout.MainSection
      render={
        <HookForm.Root
          form={form}
          onSubmit={values => {
            createTrack.mutate(values, {
              onSuccess: handleSuccess,
            });
          }}
        />
      }
    >
      <StaticPageTitle>
        <Trans message="New track" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <Breadcrumb.Root className="text-xl">
          <Breadcrumb.Item>
            <Breadcrumb.Link to="/admin/tracks">
              <Trans message="Tracks" />
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
          disabled={createTrack.isPending || uploadIsInProgress}
        >
          <Trans message="Create" />
        </Button>
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          <TrackForm showExternalIdFields />
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
    </DashboardLayout.MainSection>
  );
}

function useCreateTrackPage() {
  const uploadIsInProgress = !!useFileUploadStore(s => s.activeUploadsCount);
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const form = useForm<CreateTrackPayload>();
  const createTrack = useCreateTrack(form);

  return {
    form,
    createTrack,
    uploadIsInProgress,
    handleSuccess: (response: CreateTrackResponse) => {
      if (pathname.includes('admin')) {
        navigate(`/admin/tracks/${response.track.id}/edit`);
      } else {
        navigate(getTrackLink(response.track));
      }
    },
  };
}
