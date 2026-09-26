import {appQueries} from '@app/app-queries';
import {useCanOffline} from '@app/offline/use-can-offline';
import {webPlayerSidebarIcons} from '@app/web-player/layout/web-player-sidebar-icons';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {getPlaylistLink} from '@app/web-player/playlists/playlist-link';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useAuth} from '@common/auth/use-auth';
import {MenuItemIcon} from '@common/menus/custom-menu';
import {useCustomMenu} from '@common/menus/use-custom-menu';
import {Sidebar} from '@common/ui/dashboard/sidebar';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Dialog} from '@shadcn/dialog/dialog';
import {useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {ListPlusIcon} from 'lucide-react';
import {Link, NavLink} from 'react-router';

export function Sidenav() {
  return (
    <Sidebar.Root
      variant="floating"
      side="left"
      width="w-60"
      className="bg-card"
    >
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <PrimaryMenu />
          </Sidebar.GroupContent>
        </Sidebar.Group>
        <Sidebar.Group>
          <Sidebar.GroupLabel>
            <Trans message="Library" />
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <SecondaryMenu />
          </Sidebar.GroupContent>
        </Sidebar.Group>
        <PlaylistSection />
      </Sidebar.Content>
    </Sidebar.Root>
  );
}

function PrimaryMenu() {
  const menu = useCustomMenu('sidebar-primary');
  const {homepage} = useSettings();
  const {isLoggedIn} = useAuth();

  return (
    <Sidebar.Menu>
      {menu?.items.map(item => {
        // make sure "home" menu item leads to homepage channel and not landing page,
        // when homepage is set to landing page and user is not logged in.
        let action = item.action;
        if (action === '/' && homepage?.type === 'landingPage' && !isLoggedIn) {
          action = '/discover';
        }
        return (
          <Sidebar.MenuItem key={item.id}>
            <Sidebar.MenuButton
              render={<NavLink to={action} />}
              icon={
                <MenuItemIcon
                  item={item}
                  defaultIcons={webPlayerSidebarIcons}
                />
              }
            >
              <Trans message={item.label} />
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        );
      })}
    </Sidebar.Menu>
  );
}

function SecondaryMenu() {
  const menu = useCustomMenu('sidebar-secondary');
  const canOffline = useCanOffline();

  return (
    <Sidebar.Menu>
      {menu?.items.map(item => {
        if (item.action === '/library/downloads' && !canOffline) {
          return null;
        }
        return (
          <Sidebar.MenuItem key={item.id}>
            <Sidebar.MenuButton
              render={<NavLink to={item.action} />}
              icon={
                <MenuItemIcon
                  item={item}
                  defaultIcons={webPlayerSidebarIcons}
                />
              }
            >
              <Trans message={item.label} />
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        );
      })}
    </Sidebar.Menu>
  );
}

function PlaylistSection() {
  const {data} = useQuery(appQueries.playlists.compactAuthUserPlaylists());
  const navigate = useNavigate();
  const authHandler = useAuthClickCapture();

  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel render={<Link to="/library/playlists" />}>
        <Trans message="Playlists" />
      </Sidebar.GroupLabel>
      <CreatePlaylistDialog
        onCreate={newPlaylist => {
          navigate(getPlaylistLink(newPlaylist));
        }}
      >
        <Dialog.Trigger
          render={<Sidebar.GroupAction onClickCapture={authHandler} />}
        >
          <ListPlusIcon />
        </Dialog.Trigger>
      </CreatePlaylistDialog>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {data?.map(playlist => (
            <Sidebar.MenuItem key={playlist.id}>
              <Sidebar.MenuButton
                render={<NavLink to={getPlaylistLink(playlist)} />}
              >
                {playlist.name}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
}
