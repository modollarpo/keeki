import {appQueries} from '@app/app-queries';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {getPlaylistLink} from '@app/web-player/playlists/playlist-link';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {AdHost} from '@common/admin/ads/ad-host';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {useIsTabletMediaQuery} from '@ui/utils/hooks/is-tablet-media-query';
import {
  Disc3Icon,
  HistoryIcon,
  ListMusicIcon,
  ListPlusIcon,
  MicVocalIcon,
  MusicIcon,
} from 'lucide-react';
import {ReactElement, ReactNode, Suspense} from 'react';
import {Link, Navigate} from 'react-router';

export function Component() {
  const navigate = useNavigate();
  const authHandler = useAuthClickCapture();

  const isSmallScreen = useIsTabletMediaQuery();

  if (!isSmallScreen) {
    return <Navigate to="/library/songs" replace />;
  }

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Your tracks" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-8.5" />
      <div className="mb-5 flex items-center justify-between gap-6">
        <h1 className="text-2xl font-semibold whitespace-nowrap">
          <Trans message="Your library" />
        </h1>
        <CreatePlaylistDialog
          onCreate={newPlaylist => {
            navigate(getPlaylistLink(newPlaylist));
          }}
        >
          <Dialog.Trigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClickCapture={authHandler}
              />
            }
          >
            <ListPlusIcon className="size-5" />
          </Dialog.Trigger>
        </CreatePlaylistDialog>
      </div>
      <div>
        <MenuItem
          icon={<MusicIcon className="text-foreground" />}
          to="/library/songs"
        >
          <Trans message="Songs" />
        </MenuItem>
        <MenuItem icon={<ListMusicIcon />} to="/library/playlists">
          <Trans message="Playlists" />
        </MenuItem>
        <MenuItem icon={<Disc3Icon />} to="/library/albums">
          <Trans message="Albums" />
        </MenuItem>
        <MenuItem icon={<MicVocalIcon />} to="/library/artists">
          <Trans message="Artists" />
        </MenuItem>
        <MenuItem icon={<HistoryIcon />} to="/library/history">
          <Trans message="Play history" />
        </MenuItem>
        <Suspense fallback={<ProgressCircle size="xs" isIndeterminate />}>
          <UserPlaylists />
        </Suspense>
      </div>
    </div>
  );
}

function UserPlaylists() {
  const query = useSuspenseInfiniteQuery(
    appQueries.playlists.userPlaylists('me'),
  );
  const playlists = useFlatInfiniteQueryItems(query);
  return (
    <>
      {playlists.map(playlist => (
        <MenuItem
          key={playlist.id}
          wrapIcon={false}
          icon={
            <PlaylistImage
              size="w-10.5 h-10.5"
              className="rounded"
              playlist={playlist}
            />
          }
          to={getPlaylistLink(playlist)}
        >
          {playlist.name}
        </MenuItem>
      ))}
      <InfiniteScrollSentinel query={query} />
    </>
  );
}

interface MenuItemProps {
  icon: ReactElement;
  children: ReactNode;
  to: string;
  wrapIcon?: boolean;
}
function MenuItem({icon, children, to, wrapIcon = true}: MenuItemProps) {
  return (
    <Link className="mb-4.5 flex items-center gap-3.5 text-sm" to={to}>
      {wrapIcon ? (
        <div className="bg-secondary flex size-10.5 items-center justify-center rounded p-2 [&_svg:not([class*='size-'])]:size-4">
          {icon}
        </div>
      ) : (
        icon
      )}
      {children}
    </Link>
  );
}
