import {AlbumForm} from '@app/admin/albums-datatable-page/album-form/album-form';
import {
  UpdateAlbumPayload,
  useUpdateAlbum,
} from '@app/admin/albums-datatable-page/requests/use-update-album';
import {appQueries} from '@app/app-queries';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {useAlbumPermissions} from '@app/web-player/albums/use-album-permissions';
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
      <UpdateAlbumPage
        showExternalFields={showExternalFields}
        breadcrumbs={breadcrumbs}
      />
    </FileUploadProvider>
  );
}

function UpdateAlbumPage({
  showExternalFields = true,
  breadcrumbs,
}: Props) {
  const page = useUpdateAlbumPage();
  if (!page.canEdit) {
    return <Navigate to="/" replace />;
  }

  const {form, updateAlbum, album, uploadIsInProgress} = page;
  const title =
    breadcrumbs ?? (
      <Breadcrumb.Root className="text-xl">
        <Breadcrumb.Item>
          <Breadcrumb.Link to="/admin/albums">
            <Trans message="Albums" />
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>{album.name}</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.Root>
    );

  return (
    <DashboardLayout.MainSection
      render={
        <HookForm.Root
          form={form}
          onSubmit={values => {
            updateAlbum.mutate(values);
          }}
        />
      }
    >
      <StaticPageTitle>
        <Trans message="Edit album" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        {title}
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          <AlbumForm showExternalIdFields={showExternalFields} />
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
      <DirtyFormSaveDrawer
        isLoading={updateAlbum.isPending || uploadIsInProgress}
      />
    </DashboardLayout.MainSection>
  );
}

export function BackstageUpdateAlbumPage() {
  return (
    <FileUploadProvider>
      <BackstageUpdateAlbumPageContent />
    </FileUploadProvider>
  );
}

function BackstageUpdateAlbumPageContent() {
  const page = useUpdateAlbumPage();
  if (!page.canEdit) {
    return <Navigate to="/" replace />;
  }

  const {form, updateAlbum, album, uploadIsInProgress} = page;

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
          updateAlbum.mutate(values);
        }}
      >
        <StaticPageTitle>
          <Trans message="Edit album" />
        </StaticPageTitle>
        <BackstageHeader>
          <Breadcrumb.Root className="text-xl">
            <Breadcrumb.Item>
              <Breadcrumb.Link to={getAlbumLink(album)}>
                {album.name}
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
            <AlbumForm showExternalIdFields={false} />
          </div>
        </div>
        <DirtyFormSaveDrawer
          isLoading={updateAlbum.isPending || uploadIsInProgress}
        />
      </HookForm.Root>
    </div>
  );
}

function useUpdateAlbumPage() {
  const {albumId} = useRequiredParams(['albumId']);
  const query = useSuspenseQuery(
    appQueries.albums.get(albumId, 'editAlbumPage'),
  );
  const album = query.data.album;
  const {canEdit} = useAlbumPermissions(album);
  const uploadIsInProgress = !!useFileUploadStore(s => s.activeUploadsCount);
  const form = useForm<UpdateAlbumPayload>({
    defaultValues: {
      image: album.image,
      name: album.name,
      release_date: album.release_date,
      record_type: album.record_type,
      artists: album.artists,
      genres: album.genres,
      tags: album.tags,
      description: album.description,
      spotify_id: album.spotify_id,
      tracks: album.tracks,
    },
  });
  const updateAlbum = useUpdateAlbum(form, album.id);

  return {
    canEdit,
    form,
    updateAlbum,
    album,
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
