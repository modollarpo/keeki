import {TrackForm} from '@app/admin/tracks-datatable-page/track-form/track-form';
import {
  UpdateTrackPayload,
  useUpdateTrack,
} from '@app/admin/tracks-datatable-page/requests/use-update-track';
import {appQueries} from '@app/app-queries';
import {useTrackPermissions} from '@app/web-player/tracks/hooks/use-track-permissions';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {DirtyFormSaveDrawer} from '@common/admin/crupdate-resource-layout';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {
  FileUploadProvider,
  useFileUploadStore,
} from '@common/uploads/uploader/file-upload-provider';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {ReactElement, ReactNode} from 'react';
import {useForm} from 'react-hook-form';
import {Navigate} from 'react-router';

interface Props {
  showExternalFields?: boolean;
  breadcrumbs?: ReactElement;
}

export function Component({
  showExternalFields = true,
  breadcrumbs,
}: Props) {
  return (
    <FileUploadProvider>
      <UpdateTrackPage
        showExternalFields={showExternalFields}
        breadcrumbs={breadcrumbs}
      />
    </FileUploadProvider>
  );
}

function UpdateTrackPage({
  showExternalFields = true,
  breadcrumbs,
}: Props) {
  const page = useUpdateTrackPage();
  if (!page.canEdit) {
    return <Navigate to="/" replace />;
  }

  const {form, updateTrack, track, uploadIsInProgress} = page;
  const title =
    breadcrumbs ?? (
      <Breadcrumb.Root className="text-xl">
        <Breadcrumb.Item>
          <Breadcrumb.Link to="/admin/tracks">
            <Trans message="Tracks" />
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>{track.name}</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.Root>
    );

  return (
    <DashboardLayout.MainSection
      render={
        <HookForm.Root
          form={form}
          onSubmit={values => {
            updateTrack.mutate(values);
          }}
        />
      }
    >
      <StaticPageTitle>
        <Trans message="Edit track" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        {title}
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          <TrackForm showExternalIdFields={showExternalFields} />
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
      <DirtyFormSaveDrawer
        isLoading={updateTrack.isPending || uploadIsInProgress}
      />
    </DashboardLayout.MainSection>
  );
}

export function BackstageUpdateTrackPage() {
  return (
    <FileUploadProvider>
      <BackstageUpdateTrackPageContent />
    </FileUploadProvider>
  );
}

function BackstageUpdateTrackPageContent() {
  const page = useUpdateTrackPage();
  if (!page.canEdit) {
    return <Navigate to="/" replace />;
  }

  const {form, updateTrack, track, uploadIsInProgress} = page;

  return (
    <div className="flex h-screen flex-col">
      <Navbar.Root className="shrink-0 border-b">
        <Navbar.Logo />
        <Navbar.Content className="ml-auto">
          <Navbar.AuthContent />
        </Navbar.Content>
      </Navbar.Root>
      <HookForm.Root
        form={form}
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={values => {
          updateTrack.mutate(values);
        }}
      >
        <StaticPageTitle>
          <Trans message="Edit track" />
        </StaticPageTitle>
        <BackstageHeader>
          <Breadcrumb.Root className="text-xl">
            <Breadcrumb.Item>
              <Breadcrumb.Link to={getTrackLink(track)}>
                {track.name}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Page>
                <Trans message="Edit" />
              </Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.Root>
        </BackstageHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-14">
            <TrackForm showExternalIdFields={false} />
          </div>
        </div>
        <DirtyFormSaveDrawer
          isLoading={updateTrack.isPending || uploadIsInProgress}
        />
      </HookForm.Root>
    </div>
  );
}

function useUpdateTrackPage() {
  const {trackId} = useRequiredParams(['trackId']);
  const query = useSuspenseQuery(
    appQueries.tracks.get(trackId, 'editTrackPage'),
  );
  const track = query.data.track;
  const {canEdit} = useTrackPermissions([track]);
  const uploadIsInProgress = !!useFileUploadStore(s => s.activeUploadsCount);
  const form = useForm<UpdateTrackPayload>({
    defaultValues: {
      id: track.id,
      name: track.name,
      description: track.description,
      duration: track.duration,
      image: track.image || track.album?.image,
      src: track.src,
      spotify_id: (track as UpdateTrackPayload).spotify_id,
      album_id: (track as UpdateTrackPayload).album_id,
      artists: track.artists,
      genres: track.genres,
      tags: track.tags,
    },
  });
  const updateTrack = useUpdateTrack(form, track.id);

  return {
    canEdit,
    form,
    updateTrack,
    track,
    uploadIsInProgress,
  };
}

function BackstageHeader({children}: {children: ReactNode}) {
  return (
    <div className="flex h-14 w-full shrink-0 items-center gap-2 border-b px-4 md:px-6">
      {children}
    </div>
  );
}
