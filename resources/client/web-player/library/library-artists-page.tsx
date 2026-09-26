import {appQueries} from '@app/app-queries';
import {ArtistGridItem} from '@app/web-player/artists/artist-grid-item';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {usePlayerPagePaginationParams} from '@app/web-player/layout/use-player-page-pagination-params';
import {LibraryPageSortDropdown} from '@app/web-player/library/library-page-sort-dropdown';
import {defaultLibrarySortDescriptor} from '@app/web-player/library/library-search-params';
import {useLibraryStore} from '@app/web-player/library/state/likes-store';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {AdHost} from '@common/admin/ads/ad-host';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@shadcn/forms/input-group/input-group';
import {Spinner} from '@shadcn/spinner/spinner';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from 'lucide-react';

const sortItems = {
  'likes.created_at:desc': message('Recently added'),
  'name:asc': message('A-Z'),
};

export function Component() {
  return (
    <PlayerPageSuspense>
      <LibraryArtistsPage />
    </PlayerPageSuspense>
  );
}

function LibraryArtistsPage() {
  const {trans} = useTrans();
  const totalItems = useLibraryStore(s => Object.keys(s.artist).length);

  const {
    searchQuery,
    setSearchQuery,
    sortDescriptor,
    setSortDescriptor,
    isDefferedLoading,
    queryParams,
  } = usePlayerPagePaginationParams(defaultLibrarySortDescriptor);

  const query = useSuspenseInfiniteQuery(
    appQueries.artists.liked('me', queryParams),
  );
  const artists = useFlatInfiniteQueryItems(query);

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Your artists" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-8.5" />
      <h1 className="mb-5 text-2xl font-semibold">
        {totalItems ? (
          <Trans
            message="[one 1 liked artist|other :count liked artists]"
            values={{count: totalItems}}
          />
        ) : (
          <Trans message="My artists" />
        )}
      </h1>
      <div className="flex items-center justify-between gap-6">
        <InputGroup className="max-w-lg flex-auto">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            bindToHookForm={false}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={trans(message('Search within artists'))}
          />
          {isDefferedLoading ? (
            <InputGroupAddon align="inline-end">
              <Spinner />
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        <LibraryPageSortDropdown
          items={sortItems}
          sortDescriptor={sortDescriptor}
          setSortDescriptor={setSortDescriptor}
        />
      </div>
      <div className="mt-8.5">
        <ContentGrid>
          {artists.map(artist => (
            <ArtistGridItem key={artist.id} artist={artist} />
          ))}
          <InfiniteScrollSentinel query={query} />
        </ContentGrid>
      </div>
      {!artists.length ? (
        <MediaPageNoResultsMessage
          className="mt-8.5"
          searchQuery={searchQuery}
          description={
            <Trans message="You have not added any artists to your library yet." />
          }
        />
      ) : null}
      <AdHost slot="general_bottom" className="mt-8.5" />
    </div>
  );
}
