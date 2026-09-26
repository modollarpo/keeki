import {useOfflineEntitiesStore} from '@app/offline/offline-entities-store';
import {OfflineQueueToast} from '@app/offline/offline-queue-toast';
import {MobileNavbar} from '@app/web-player/layout/mobile-navbar';
import {PlayerNavbar} from '@app/web-player/layout/player-navbar';
import {QueueSidenav} from '@app/web-player/layout/queue/queue-sidenav';
import {Sidenav} from '@app/web-player/layout/sidenav';
import {PlayerOverlay} from '@app/web-player/overlay/player-overlay';
import {DesktopPlayerControls} from '@app/web-player/player-controls/desktop-player-controls';
import {MobilePlayerControls} from '@app/web-player/player-controls/mobile-player-controls';
import {playerStoreOptions} from '@app/web-player/state/player-store-options';
import {PlayerContext} from '@common/player/player-context';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {onlineManager} from '@tanstack/react-query';
import {useSettings} from '@ui/settings/use-settings';
import {cn} from '@ui/utils/cn';
import {useIsTabletMediaQuery} from '@ui/utils/hooks/is-tablet-media-query';
import {useLayoutEffect, useRef} from 'react';
import {Outlet, useLocation} from 'react-router';

// if the service worker initializes with the window being offline, set the online manager to offline
if ((window as any).beSwInitialIsOffline) {
  onlineManager.setOnline(false);
}

export function WebPlayerLayout() {
  const {player} = useSettings();
  const isMobile = useIsTabletMediaQuery();

  const content = isMobile ? (
    <div className="bg flex h-screen flex-col">
      <MobileNavbar />
      <Main />
      <MobilePlayerControls />
    </div>
  ) : (
    <DashboardLayout.Root
      name="web-player"
      defaultRightSidebarStatus={player?.hide_queue ? 'collapsed' : 'expanded'}
    >
      <PlayerNavbar />
      <DashboardLayout.Content>
        <Sidenav />
        <DashboardLayout.MainSection className="overflow-hidden">
          <Main />
        </DashboardLayout.MainSection>
        <QueueSidenav />
      </DashboardLayout.Content>
      <DesktopPlayerControls />
    </DashboardLayout.Root>
  );

  return (
    <PlayerContext id="web-player" options={playerStoreOptions}>
      {content}
      <PlayerOverlay />
      <OfflineQueueToastWrapper />
    </PlayerContext>
  );
}

function OfflineQueueToastWrapper() {
  const offlineQueueSize = useOfflineEntitiesStore(s => s.offlineQueue.size);
  const offlineToastVisible = useOfflineEntitiesStore(
    s => s.offlineToastVisible,
  );
  if (!offlineToastVisible || offlineQueueSize === 0) {
    return null;
  }
  return <OfflineQueueToast />;
}

interface MainProps {
  className?: string;
}
function Main({className}: MainProps) {
  const {pathname} = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }
  }, [pathname]);

  return (
    <main
      ref={scrollContainerRef}
      className={cn(
        'compact-scrollbar stable-scrollbar relative flex-auto overflow-x-hidden',
        className,
      )}
    >
      <div className="web-player-container @container mx-auto min-h-full p-4 md:p-7.5">
        <Outlet />
      </div>
    </main>
  );
}
