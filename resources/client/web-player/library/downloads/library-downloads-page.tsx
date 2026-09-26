import {DownloadsSettingsDialog} from '@app/web-player/library/downloads/downloads-settings-dialog';
import {AdHost} from '@common/admin/ads/ad-host';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Tabs} from '@shadcn/tabs/tabs';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {InfoIcon} from 'lucide-react';
import {Outlet, useLocation} from 'react-router';

export function Component() {
  return (
    <div>
      <StaticPageTitle>
        <Trans message="Downloads - Library" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-8.5" />
      <div className="flex items-center justify-between gap-6">
        <h1 className="w-max text-2xl font-semibold whitespace-nowrap md:w-full">
          <Trans message="Downloads" />
        </h1>
        <DownloadsSettingsDialog>
          <Tooltip.Root>
            <Dialog.Trigger
              render={
                <Tooltip.Trigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                    />
                  }
                />
              }
            >
              <InfoIcon />
            </Dialog.Trigger>
            <Tooltip.Content>
              <Trans message="Space usage" />
            </Tooltip.Content>
          </Tooltip.Root>
        </DownloadsSettingsDialog>
      </div>
      <LibraryTabs />
      <AdHost slot="general_bottom" className="mt-8.5" />
    </div>
  );
}

function LibraryTabs() {
  const {pathname} = useLocation();
  const selectedTab = getCurrentTab(pathname.split('/').pop());
  return (
    <Tabs.Root className="mt-3.5" value={selectedTab}>
      <div className="border-b">
        <Tabs.List variant="line">
          <Tabs.LinkTab value="songs" to="/library/downloads/songs">
            <Trans message="Songs" />
          </Tabs.LinkTab>
          <Tabs.LinkTab value="playlists" to="/library/downloads/playlists">
            <Trans message="Playlists" />
          </Tabs.LinkTab>
          <Tabs.LinkTab value="albums" to="/library/downloads/albums">
            <Trans message="Albums" />
          </Tabs.LinkTab>
        </Tabs.List>
      </div>
      <Outlet />
    </Tabs.Root>
  );
}

function getCurrentTab(lastSegment: string | undefined): string {
  switch (lastSegment) {
    case 'playlists':
      return 'playlists';
    case 'albums':
      return 'albums';
    default:
      return 'songs';
  }
}
