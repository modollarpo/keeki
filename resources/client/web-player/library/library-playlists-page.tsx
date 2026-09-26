import {appQueries} from '@app/app-queries';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {usePlayerPagePaginationParams} from '@app/web-player/layout/use-player-page-pagination-params';
import {LibraryPageSortDropdown} from '@app/web-player/library/library-page-sort-dropdown';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {PlaylistGridItem} from '@app/web-player/playlists/playlist-grid-item';
import {getPlaylistLink} from '@app/web-player/playlists/playlist-link';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {AdHost} from '@common/admin/ads/ad-host';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@shadcn/forms/input-group/input-group';
import {Spinner} from '@shadcn/spinner/spinner';
import {useQuery, useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {ListPlusIcon, SearchIcon} from 'lucide-react';

const sortItems = {
  'updated_at:desc': message('Recently updated'),
  'name:asc': message('A-Z'),
  'views:desc': message('Most viewed'),
  'plays:desc': message('Most played'),
};

const defaultSortDescriptor = {
  orderBy: 'updated_at',
  orderDir: 'desc',
} satisfies SortDescriptor;

export function Component() {
  return (
    <PlayerPageSuspense>
      <LibraryPlaylistsPage />
    </PlayerPageSuspense>
  );
}

function LibraryPlaylistsPage() {
  const navigate = useNavigate();
  const authHandler = useAuthClickCapture();
  const {trans} = useTrans();
  const {data} = useQuery(appQueries.playlists.compactAuthUserPlaylists());
  const totalItems = data.length;

  const {
    searchQuery,
    setSearchQuery,
    sortDescriptor,
    setSortDescriptor,
    isDefferedLoading,
    queryParams,
  } = usePlayerPagePaginationParams(defaultSortDescriptor);

  const query = useSuspenseInfiniteQuery(
    appQueries.playlists.userPlaylists('me', queryParams),
  );
  const playlists = useFlatInfiniteQueryItems(query);

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Your playlists" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-8.5" />
      <div className="mb-5 flex items-center justify-between gap-6">
        <h1 className="text-2xl font-semibold whitespace-nowrap">
          {totalItems ? (
            <Trans
              message="[one 1 playlist|other :count playlists]"
              values={{count: totalItems}}
            />
          ) : (
            <Trans message="My playlists" />
          )}
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

      <div className="flex items-center justify-between gap-6">
        <InputGroup className="max-w-lg flex-auto">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            bindToHookForm={false}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={trans(message('Search within playlists'))}
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
          {playlists.map(playlist => (
            <PlaylistGridItem key={playlist.id} playlist={playlist} />
          ))}
          <InfiniteScrollSentinel query={query} />
        </ContentGrid>
      </div>
      {!playlists.length ? (
        <MediaPageNoResultsMessage
          className="mt-8.5"
          searchQuery={searchQuery}
          description={
            <Trans message="You have not added any playlists to your library yet." />
          }
        />
      ) : null}
    </div>
  );
}
