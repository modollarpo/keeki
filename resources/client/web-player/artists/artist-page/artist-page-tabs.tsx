import {artistPageTabs} from '@app/web-player/artists/artist-page-tabs';
import {ArtistAboutTab} from '@app/web-player/artists/artist-page/artist-about-tab';
import {ArtistAlbumsTab} from '@app/web-player/artists/artist-page/artist-albums-tab';
import {ArtistTracksTab} from '@app/web-player/artists/artist-page/artist-tracks-tab';
import {DiscographyTab} from '@app/web-player/artists/artist-page/discography-panel/discography-tab';
import {ArtistFollowersTab} from '@app/web-player/artists/artist-page/followers-panel/artist-followers-tab';
import {SimilarArtistsPanel} from '@app/web-player/artists/artist-page/similar-artists-panel';
import {useArtistPageTabs} from '@app/web-player/artists/artist-page/use-artist-page-tabs';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {Tabs} from '@shadcn/tabs/tabs';
import {Trans} from '@ui/i18n/trans';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {Suspense} from 'react';
import {useSearchParams} from 'react-router';

interface Props {
  data: GetArtistResponse;
}
export function ArtistPageTabs({data}: Props) {
  const {selectedIndex, activeTabs} = useArtistPageTabs(data.artist);
  const selectedTab = activeTabs?.[selectedIndex]?.name;

  return (
    <Tabs.Root className="mt-6 md:mt-12" value={selectedTab}>
      <div className="border-b">
        <Tabs.List variant="line">
          {activeTabs.map((tab, index) => {
            const to = index === 0 ? '' : `?tab=${tab.name}`;
            return (
              <Tabs.LinkTab key={tab.name} value={tab.name} to={to}>
                <TabLabel name={tab.name} />
              </Tabs.LinkTab>
            );
          })}
        </Tabs.List>
      </div>
      <div className="mt-3 md:mt-6">
        <Suspense
          // re-render suspense when selected tab changes, otherwise loading spinner won't be visible
          key={selectedTab}
          fallback={
            <div className="flex min-h-31 items-center justify-center">
              <FullPageLoader />
            </div>
          }
        >
          <ActiveTab data={data} />
        </Suspense>
      </div>
    </Tabs.Root>
  );
}

function TabLabel({name}: {name: keyof typeof artistPageTabs}) {
  switch (name) {
    case 'discography':
      return <Trans message="Discography" />;
    case 'similar':
      return <Trans message="Similar artists" />;
    case 'about':
      return <Trans message="About" />;
    case 'tracks':
      return <Trans message="Tracks" />;
    case 'albums':
      return <Trans message="Albums" />;
    case 'followers':
      return <Trans message="Followers" />;
  }
}

type ActiveTabProps = {
  data: GetArtistResponse;
};
function ActiveTab({data}: ActiveTabProps) {
  const {activeTabs} = useArtistPageTabs(data.artist);
  const [searchParams] = useSearchParams();
  const tabName = searchParams.get('tab') as keyof typeof artistPageTabs;
  let activeTab = activeTabs.find(t => t.name === tabName);
  if (!activeTab) {
    activeTab = activeTabs[0];
  }
  switch (activeTab.name) {
    case 'discography':
      return <DiscographyTab data={data} />;
    case 'similar':
      return <SimilarArtistsPanel artist={data.artist} />;
    case 'about':
      return <ArtistAboutTab artist={data.artist} />;
    case 'tracks':
      return <ArtistTracksTab data={data} />;
    case 'albums':
      return <ArtistAlbumsTab data={data} />;
    case 'followers':
      return <ArtistFollowersTab data={data} />;
  }
}
