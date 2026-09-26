import {ArtistPageSettings} from '@app/admin/settings/player-settings/artist-page-settings';
import {FunctionalitySettings} from '@app/admin/settings/player-settings/functionality-settings';
import {InterfaceSettings} from '@app/admin/settings/player-settings/interface-settings';
import {Tabs} from '@shadcn/tabs/tabs';
import {Trans} from '@ui/i18n/trans';
import {ReactElement} from 'react';
import {useSearchParams} from 'react-router';

const allTabs = [
  {
    name: 'functionality',
    label: <Trans message="Functionality" />,
  },
  {
    name: 'interface',
    label: <Trans message="Interface" />,
  },
  {
    name: 'artistPage',
    label: <Trans message="Artist page" />,
  },
] as const;

type TabName = (typeof allTabs)[number]['name'];

export function Component() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamTab = searchParams.get('tab');
  const tabName = allTabs.some(tab => tab.name === searchParamTab)
    ? (searchParamTab as TabName)
    : 'functionality';

  return (
    <TabContent
      tabName={tabName}
      tabs={
        <Tabs.Root
          value={tabName}
          onValueChange={value => {
            setSearchParams({tab: value}, {replace: true});
          }}
        >
          <div className="mx-6 border-b">
            <Tabs.List variant="line">
              {allTabs.map(tab => (
                <Tabs.Tab key={tab.name} value={tab.name}>
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </div>
        </Tabs.Root>
      }
    />
  );
}

interface TabContentProps {
  tabName: TabName;
  tabs: ReactElement;
}
function TabContent({tabName, tabs}: TabContentProps) {
  const title = <Trans message="Web player" />;
  switch (tabName) {
    case 'functionality':
      return <FunctionalitySettings tabs={tabs} title={title} />;
    case 'interface':
      return <InterfaceSettings tabs={tabs} title={title} />;
    case 'artistPage':
      return <ArtistPageSettings tabs={tabs} title={title} />;
  }
}
