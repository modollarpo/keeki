import {AlbumForm} from '@app/admin/albums-datatable-page/album-form/album-form';
import {
  CreateAlbumPayload,
  useCreateAlbum,
} from '@app/admin/albums-datatable-page/requests/use-create-album';
import {FullAlbum} from '@app/web-player/albums/album';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useNormalizedModel} from '@common/ui/normalized-model/use-normalized-model';
import {
  FileUploadProvider,
  useFileUploadStore,
} from '@common/uploads/uploader/file-upload-provider';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Button} from '@shadcn/button/button';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useCurrentDateTime} from '@ui/i18n/use-current-date-time';
import {ReactNode, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useLocation, useSearchParams} from 'react-router';

export function Component() {
  return (
    <FileUploadProvider>
      <CreateAlbumPage />
    </FileUploadProvider>
  );
}

function CreateAlbumPage() {
  const page = useCreateAlbumPage();
  const {form, createAlbum, uploadIsInProgress, handleSuccess} = page;

  return (
    <DashboardLayout.MainSection
      render={
        <HookForm.Root
          form={form}
          onSubmit={values => {
            createAlbum.mutate(values, {
              onSuccess: handleSuccess,
            });
          }}
        />
      }
    >
      <StaticPageTitle>
        <Trans message="New album" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <Breadcrumb.Root className="text-xl">
          <Breadcrumb.Item>
            <Breadcrumb.Link to="/admin/albums">
              <Trans message="Albums" />
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
          disabled={createAlbum.isPending || uploadIsInProgress}
        >
          <Trans message="Create" />
        </Button>
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          <AlbumForm showExternalIdFields />
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
    </DashboardLayout.MainSection>
  );
}

export function BackstageCreateAlbumPage() {
  return (
    <FileUploadProvider>
      <BackstageCreateAlbumPageContent />
    </FileUploadProvider>
  );
}

function BackstageCreateAlbumPageContent() {
  const [searchParams] = useSearchParams();
  const page = useCreateAlbumPage();
  const {form, createAlbum, uploadIsInProgress, handleSuccess} = page;

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
          createAlbum.mutate(values, {
            onSuccess: handleSuccess,
          });
        }}
      >
        <StaticPageTitle>
          <Trans message="New album" />
        </StaticPageTitle>
        <BackstageHeader>
          <Breadcrumb.Root className="text-xl">
            <Breadcrumb.Item>
              <Breadcrumb.Link
                to={`/backstage/artists/${searchParams.get('artistId')}/edit`}
              >
                <Trans message="Backstage" />
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Page>
                <Trans message="New album" />
              </Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.Root>
          <Button
            variant="default"
            color="primary"
            type="submit"
            className="ml-auto"
            disabled={createAlbum.isPending || uploadIsInProgress}
          >
            <Trans message="Create" />
          </Button>
        </BackstageHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-14">
            <AlbumForm showExternalIdFields={false} />
          </div>
        </div>
      </HookForm.Root>
    </div>
  );
}

function useCreateAlbumPage() {
  const uploadIsInProgress = !!useFileUploadStore(s => s.activeUploadsCount);
  const now = useCurrentDateTime();
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const [searchParams] = useSearchParams();
  const artistId = searchParams.get('artistId');
  const {data} = useNormalizedModel(
    `normalized-models/artist/${artistId}`,
    undefined,
    {enabled: !!artistId},
  );
  const artist = data?.data;
  const form = useForm<CreateAlbumPayload>({
    defaultValues: {
      release_date: now.toAbsoluteString(),
      record_type: 'album',
    },
  });
  const createAlbum = useCreateAlbum(form);

  useEffect(() => {
    if (artist) {
      form.setValue('artists', [artist]);
    }
  }, [artist, form]);

  return {
    form,
    createAlbum,
    uploadIsInProgress,
    handleSuccess: (response: {album: FullAlbum}) => {
      if (pathname.includes('admin')) {
        if (artist) {
          navigate(`/admin/artists/${artist.id}/edit`);
        } else {
          navigate('/admin/albums');
        }
      } else {
        navigate(getAlbumLink(response.album));
      }
    },
  };
}

function BackstageHeader({children}: {children: ReactNode}) {
  return (
    <div className="flex h-14 w-full shrink-0 items-center gap-2 border-b px-4 md:px-6">
      {children}
    </div>
  );
}
