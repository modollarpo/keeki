import {appQueries} from '@app/app-queries';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Empty} from '@shadcn/empty/empty';
import {Input} from '@shadcn/forms/input/input';
import {Tabs} from '@shadcn/tabs/tabs';
import {useSuspenseQuery} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {useSettings} from '@ui/settings/use-settings';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';
import debounce from 'just-debounce-it';
import {SearchIcon} from 'lucide-react';
import {Fragment, useCallback} from 'react';
import {Outlet, useParams} from 'react-router';

export function Component() {
  const {searchQuery} = useParams();
  return (
    <Fragment>
      <MobileSearchBar />
      {searchQuery ? (
        <PlayerPageSuspense resetSuspenseOnNavigate={false}>
          <SearchResults searchQuery={searchQuery} />
        </PlayerPageSuspense>
      ) : (
        <IdleFallback />
      )}
    </Fragment>
  );
}

function MobileSearchBar() {
  const params = useParams();
  const navigate = useNavigate();
  const {trans} = useTrans();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const debouncedNavigate = useCallback(
    debounce(
      (query: string) => navigate(`/search/${query}`, {replace: true}),
      300,
    ),
    [navigate],
  );

  if (!isMobile) {
    return null;
  }

  return (
    <Input
      bindToHookForm={false}
      defaultValue={params.searchQuery || ''}
      onChange={e => debouncedNavigate(e.target.value)}
      autoFocus
      className="w-full"
      placeholder={trans(message('Search...'))}
    />
  );
}

function IdleFallback() {
  const {branding} = useSettings();
  return (
    <Empty className="mt-10">
      <Empty.Header>
        <Empty.Media variant="icon">
          <SearchIcon />
        </Empty.Media>
        <Empty.Title>
          <Trans
            message="Search :siteName"
            values={{siteName: branding.site_name}}
          />
        </Empty.Title>
        <Empty.Description>
          <Trans message="Find songs, artists, albums, playlists and more." />
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
}

interface SearchResultsProps {
  searchQuery: string;
}
function SearchResults({searchQuery}: SearchResultsProps) {
  const params = useParams();
  const query = useSuspenseQuery(
    appQueries.search.results('searchPage', searchQuery),
  );
  const results = query.data.results;

  if (!results) {
    throw new Error(`Invalid response from api: ${JSON.stringify(results)}`);
  }

  const selectedTab = params.tabName ?? 'home';

  const tabLink = (tabName?: string) => {
    let base = `/search/${searchQuery}`;
    if (tabName) {
      base += `/${tabName}`;
    }
    return base;
  };

  const haveAnyResults = Object.entries(results).some(
    ([, r]) => r?.data.length,
  );

  if (!haveAnyResults) {
    return (
      <Empty className="mt-10">
        <Empty.Header>
          <Empty.Media variant="icon">
            <SearchIcon />
          </Empty.Media>
          <Empty.Title>
            <Trans
              message="Not results for “:query“"
              values={{query: searchQuery}}
            />
          </Empty.Title>
          <Empty.Description>
            <Trans message="Please try a different search query" />
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <Tabs.Root value={selectedTab}>
      <div className="border-b">
        <Tabs.List variant="line">
          <Tabs.LinkTab value="home" to={tabLink()}>
            <Trans message="Top results" />
          </Tabs.LinkTab>
          {results.tracks?.data.length ? (
            <Tabs.LinkTab value="tracks" to={tabLink('tracks')}>
              <Trans message="Tracks" />
            </Tabs.LinkTab>
          ) : null}
          {results.artists?.data.length ? (
            <Tabs.LinkTab value="artists" to={tabLink('artists')}>
              <Trans message="Artists" />
            </Tabs.LinkTab>
          ) : null}
          {results.albums?.data.length ? (
            <Tabs.LinkTab value="albums" to={tabLink('albums')}>
              <Trans message="Albums" />
            </Tabs.LinkTab>
          ) : null}
          {results.playlists?.data.length ? (
            <Tabs.LinkTab value="playlists" to={tabLink('playlists')}>
              <Trans message="Playlists" />
            </Tabs.LinkTab>
          ) : null}
          {results.users?.data.length ? (
            <Tabs.LinkTab value="users" to={tabLink('users')}>
              <Trans message="Profiles" />
            </Tabs.LinkTab>
          ) : null}
        </Tabs.List>
      </div>
      <div className="pt-2">
        <Outlet context={results} />
      </div>
    </Tabs.Root>
  );
}
