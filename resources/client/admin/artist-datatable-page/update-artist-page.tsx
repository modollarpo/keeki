import {CrupdateArtistForm} from '@app/admin/artist-datatable-page/artist-form/crupdate-artist-form';
import {
  UpdateArtistPayload,
  useUpdateArtist,
} from '@app/admin/artist-datatable-page/requests/use-update-artist';
import {appQueries} from '@app/app-queries';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {useArtistPermissions} from '@app/web-player/artists/use-artist-permissions';
import {DirtyFormSaveDrawer} from '@common/admin/crupdate-resource-layout';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
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
  const page = useUpdateArtistPage();
  if (!page.canEdit) {
    return <Navigate to="/" replace />;
  }

  const {form, updateArtist, artist, albums} = page;
  const title =
    breadcrumbs ?? (
      <Breadcrumb.Root className="text-xl">
        <Breadcrumb.Item>
          <Breadcrumb.Link to="/admin/artists">
            <Trans message="Artists" />
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>{artist.name}</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.Root>
    );

  return (
    <DashboardLayout.MainSection
      render={
        <HookForm.Root
          form={form}
          onSubmit={values => {
            updateArtist.mutate(values);
          }}
        />
      }
    >
      <StaticPageTitle>
        <Trans message="Edit artist" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        {title}
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          <CrupdateArtistForm
            albums={albums}
            showExternalFields={showExternalFields}
          />
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
      <DirtyFormSaveDrawer isLoading={updateArtist.isPending} />
    </DashboardLayout.MainSection>
  );
}

export function BackstageUpdateArtistPage() {
  const page = useUpdateArtistPage();
  if (!page.canEdit) {
    return <Navigate to="/" replace />;
  }

  const {form, updateArtist, artist, albums} = page;

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
          updateArtist.mutate(values);
        }}
      >
        <StaticPageTitle>
          <Trans message="Edit artist" />
        </StaticPageTitle>
        <BackstageHeader>
          <Breadcrumb.Root className="text-xl">
            <Breadcrumb.Item>
              <Breadcrumb.Link to={getArtistLink(artist)}>
                {artist.name}
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
            <CrupdateArtistForm albums={albums} showExternalFields={false} />
          </div>
        </div>
        <DirtyFormSaveDrawer isLoading={updateArtist.isPending} />
      </HookForm.Root>
    </div>
  );
}

function useUpdateArtistPage() {
  const {artistId} = useRequiredParams(['artistId']);
  const query = useSuspenseQuery(
    appQueries.artists.show(artistId).artist('editArtistPage'),
  );
  const artist = query.data.artist;
  const {canEdit} = useArtistPermissions(artist);
  const form = useForm<UpdateArtistPayload>({
    defaultValues: {
      id: artist.id,
      name: artist.name,
      verified: artist.verified,
      spotify_id: artist.spotify_id,
      genres: artist.genres,
      image_small: artist.image_small,
      links: artist.links,
      profile: artist.profile,
      profile_images: artist.profile_images,
      disabled: artist.disabled,
    },
  });
  const updateArtist = useUpdateArtist(form);

  return {
    canEdit,
    form,
    updateArtist,
    artist,
    albums: query.data.albums?.data,
  };
}

function BackstageHeader({children}: {children: ReactNode}) {
  return (
    <div className="flex h-14 w-full shrink-0 items-center gap-2 border-b px-4 md:px-6">
      {children}
    </div>
  );
}
