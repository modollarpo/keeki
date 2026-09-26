import {getArtistLink} from '@app/web-player/artists/artist-link';
import {usePrimaryArtistForCurrentUser} from '@app/web-player/backstage/use-primary-artist-for-current-user';
import {SearchAutocomplete} from '@app/web-player/search/search-autocomplete';
import {useAuth} from '@common/auth/use-auth';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {LinkButton} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {cn} from '@ui/utils/cn';
import {MicVocalIcon} from 'lucide-react';
import {Fragment, use, useMemo} from 'react';
import {Link} from 'react-router';

export function PlayerNavbar() {
  const primaryArtist = usePrimaryArtistForCurrentUser();
  const {leftSidebar} = use(DashboardLayoutContext);
  const {player} = useSettings();
  const menuItems = useMemo(() => {
    if (primaryArtist) {
      return [
        <Dropdown.LinkItem
          key="author"
          render={<Link to={getArtistLink(primaryArtist)} />}
        >
          <MicVocalIcon />
          <Trans message="Artist profile" />
        </Dropdown.LinkItem>,
      ];
    }
    if (player?.show_become_artist_btn) {
      return [
        <Dropdown.LinkItem
          key="author"
          render={<Link to="/backstage/requests" />}
        >
          <MicVocalIcon />
          <Trans message="Become an author" />
        </Dropdown.LinkItem>,
      ];
    }

    return [];
  }, [primaryArtist, player?.show_become_artist_btn]);

  return (
    <DashboardLayout.Navbar className="gap-2">
      <div
        className={cn(
          'flex h-full items-center',
          leftSidebar.status === 'expanded' && 'min-w-57',
        )}
      >
        <Navbar.Logo />
      </div>
      <SearchAutocomplete />
      <Navbar.Content className="ml-auto">
        <ActionButtons />
        <Navbar.AuthContent menuItems={menuItems} />
      </Navbar.Content>
    </DashboardLayout.Navbar>
  );
}

function ActionButtons() {
  const {player, billing} = useSettings();
  const {isLoggedIn, hasPermission, isSubscribed} = useAuth();

  const showUploadButton =
    player?.show_upload_btn && isLoggedIn && hasPermission('music.create');
  const showTryProButton = billing?.enable && !isSubscribed;

  return (
    <Fragment>
      {showTryProButton ? (
        <LinkButton variant="outline" size="sm" color="primary" to="/pricing">
          <Trans message="Try Pro" />
        </LinkButton>
      ) : null}
      {showUploadButton ? (
        <LinkButton
          variant={showTryProButton ? 'ghost' : 'outline'}
          size="sm"
          color={showTryProButton ? undefined : 'primary'}
          to="/backstage/upload"
        >
          <Trans message="Upload" />
        </LinkButton>
      ) : null}
    </Fragment>
  );
}
