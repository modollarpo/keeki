import {getArtistLink} from '@app/web-player/artists/artist-link';
import {usePrimaryArtistForCurrentUser} from '@app/web-player/backstage/use-primary-artist-for-current-user';
import {webPlayerSidebarIcons} from '@app/web-player/layout/web-player-sidebar-icons';
import {BufferingIndicator} from '@app/web-player/player-controls/buffering-indicator';
import {useCuedTrack} from '@app/web-player/player-controls/use-cued-track';
import {playerOverlayState} from '@app/web-player/state/player-overlay-store';
import {PlayerBarAmbientBackground} from '@app/web-player/player-controls/player-bar-ambient-background';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {useAuth} from '@common/auth/use-auth';
import {UnstyledCustomMenuItem} from '@common/menus/custom-menu';
import {useCustomMenu} from '@common/menus/use-custom-menu';
import {useCurrentTime} from '@common/player/hooks/use-current-time';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {NextButton} from '@common/player/ui/controls/next-button';
import {PlayButton} from '@common/player/ui/controls/play-button';
import {PreviousButton} from '@common/player/ui/controls/previous-button';
import {NavbarAuthMenu} from '@common/ui/navigation/navbar/navbar-auth-menu';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Badge} from '@ui/badge/badge';
import {Trans} from '@ui/i18n/trans';
import {ProgressBar} from '@ui/progress/progress-bar';
import {useSettings} from '@ui/settings/use-settings';
import {cn} from '@ui/utils/cn';
import {CircleUser, MicVocalIcon} from 'lucide-react';
import {ComponentProps, ReactElement} from 'react';

export function MobilePlayerControls() {
  return (
    <div className="relative overflow-hidden border-t border-border/50 shadow-[0_-4px_32px_rgba(0,0,0,0.1)] w-full pb-[env(safe-area-inset-bottom)]">
      <PlayerBarAmbientBackground />
      <PlayerControls />
      <MobileNavbar />
    </div>
  );
}

function PlayerControls() {
  const mediaIsCued = usePlayerStore(s => s.cuedMedia != null);
  if (!mediaIsCued) return null;

  return (
    <div
      className="relative flex items-center justify-between gap-6 px-3 py-2 transition-colors active:bg-foreground/5"
      onClick={() => {
        playerOverlayState.toggle();
      }}
    >
      <QueuedTrack />
      <PlaybackButtons />
      <PlayerProgressBar />
    </div>
  );
}

function QueuedTrack() {
  const track = useCuedTrack();

  if (!track) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-auto items-center gap-2.5 group">
      <TrackImage className="h-9 w-9 rounded object-cover shadow-sm transition-all duration-300 ease-out group-active:scale-95 group-active:brightness-90" track={track} />
      <div className="flex-auto overflow-hidden whitespace-nowrap flex flex-col justify-center">
        <div className="overflow-hidden text-be-body font-bold text-ellipsis text-foreground">
          {track.name}
        </div>
        <div className="text-muted-foreground overflow-hidden text-be-caption font-medium text-ellipsis mt-0.5">
          {track.artists?.map(a => a.name).join(', ')}
        </div>
      </div>
    </div>
  );
}

function PlaybackButtons() {
  return (
    <div className="flex items-center justify-center">
      <PreviousButton stopPropagation />
      <div className="relative isolate">
        <BufferingIndicator />
        <PlayButton className="text-[var(--be-brand-ink)] hover:scale-105 active:scale-95 transition-transform" iconClassName="size-8" stopPropagation size="icon-lg" />
      </div>
      <NextButton stopPropagation />
    </div>
  );
}

function PlayerProgressBar() {
  const duration = usePlayerStore(s => s.mediaDuration);
  const currentTime = useCurrentTime();
  return (
    <ProgressBar
      size="xs"
      className="absolute right-0 bottom-0 left-0"
      trackColor="bg-border/30"
      progressColor="bg-[var(--be-brand-ink)]"
      trackHeight="h-[2px]"
      radius="rounded-none"
      minValue={0}
      maxValue={duration}
      value={currentTime}
    />
  );
}

function MobileNavbar() {
  const menu = useCustomMenu('mobile-bottom');
  if (!menu) return null;

  return (
    <div className="flex items-center justify-between gap-6 px-[max(8%,20px)] pt-3 pb-3">
      {menu.items.map(item => (
        <UnstyledCustomMenuItem
          key={item.id}
          item={item}
          defaultIcons={webPlayerSidebarIcons}
          className={({isActive}) =>
            cn(
              "flex flex-col items-center gap-1 overflow-hidden text-[11px] whitespace-nowrap transition-colors duration-200 [&_svg:not([class*='size-'])]:size-[22px]",
              isActive 
                ? 'text-primary font-bold scale-[1.02]' 
                : 'text-muted-foreground font-medium',
            )
          }
        />
      ))}
      <AccountButton />
    </div>
  );
}

function AccountButton() {
  const {user} = useAuth();
  const hasUnreadNotif = !!user?.unread_notifications_count;
  const navigate = useNavigate();
  const {registration, player} = useSettings();
  const primaryArtist = usePrimaryArtistForCurrentUser();

  const menuItems: ReactElement<ComponentProps<typeof Dropdown.Item>>[] = [];
  if (primaryArtist) {
    menuItems.push(
      <Dropdown.Item
        key="author"
        onClick={() => {
          navigate(getArtistLink(primaryArtist));
        }}
      >
        <MicVocalIcon />
        <Trans message="Artist profile" />
      </Dropdown.Item>,
    );
  } else if (player?.show_become_artist_btn) {
    menuItems.push(
      <Dropdown.Item
        key="author"
        onClick={() => {
          navigate('/backstage/requests');
        }}
      >
        <MicVocalIcon />
        <Trans message="Become an author" />
      </Dropdown.Item>,
    );
  }

  const trigger = (
    <Dropdown.Trigger className="relative text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors outline-none">
      {user?.image ? (
        <img
          src={user.image}
          alt=""
          className="mx-auto mb-1 block size-[22px] rounded-full object-cover shadow-sm border border-border/50"
        />
      ) : (
        <CircleUser className="mx-auto mb-1 block size-[22px] opacity-80" strokeWidth={1.5} />
      )}
      {hasUnreadNotif ? (
        <Badge className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] rounded-full bg-red-500 text-white border border-background shadow-sm">
          {user?.unread_notifications_count}
        </Badge>
      ) : null}
      <div className="mt-0.5">
        <Trans message="Account" />
      </div>
    </Dropdown.Trigger>
  );

  if (!user) {
    return (
      <Dropdown.Root>
        {trigger}
        <Dropdown.Content side="top" align="center">
          <Dropdown.Item onClick={() => navigate('/login')}>
            <Trans message="Login" />
          </Dropdown.Item>
          {!registration?.disable && (
            <Dropdown.Item onClick={() => navigate('/register')}>
              <Trans message="Register" />
            </Dropdown.Item>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
    );
  }

  return (
    <NavbarAuthMenu items={menuItems} side="top" align="center">
      {trigger}
    </NavbarAuthMenu>
  );
}
