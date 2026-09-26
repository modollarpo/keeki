import {appQueries} from '@app/app-queries';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {usePlayerPagePaginationParams} from '@app/web-player/layout/use-player-page-pagination-params';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {LibraryPageTrack} from '@app/web-player/tracks/track';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {AdHost} from '@common/admin/ads/ad-host';
import {useAuth} from '@common/auth/use-auth';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {TableDataItem} from '@common/ui/tables/types/table-data-item';
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
import {useCallback, useMemo} from 'react';

const defaultSortDescriptor = {
  orderBy: 'track_plays.created_at',
  orderDir: 'desc',
} satisfies SortDescriptor;

export function Component() {
  return (
    <PlayerPageSuspense>
      <LibraryHistoryPage />
    </PlayerPageSuspense>
  );
}

function LibraryHistoryPage() {
  const {user} = useAuth();

  const {searchQuery, setSearchQuery, isDefferedLoading, queryParams} =
    usePlayerPagePaginationParams(defaultSortDescriptor);

  const query = useSuspenseInfiniteQuery(
    appQueries.userProfile(user!.id).playHistory(queryParams),
  );
  const tracks = useFlatInfiniteQueryItems(query);

  const {trans} = useTrans();
  const userWithModelType = useMemo(
    () => ({...user!, model_type: 'user'}),
    [user],
  );
  const queueId = queueGroupId(userWithModelType, 'playHistory');

  // same track can appear in history multiple times, generate unique key based on listen time
  const rowKeyGenerator = useCallback((item: TableDataItem) => {
    return `${item.id}-${(item as LibraryPageTrack).added_at}`;
  }, []);

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Listening history" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-8.5" />
      <div className="mb-8.5 flex flex-wrap items-center justify-between gap-6">
        <h1 className="w-max text-2xl font-semibold whitespace-nowrap md:w-full">
          <Trans message="Listening history" />
        </h1>
        <PlaybackToggleButton
          queueId={queueId}
          buttonType="text"
          className="min-w-32 shrink-0"
        />
        <InputGroup className="max-w-lg flex-auto">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            bindToHookForm={false}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={trans(message('Search within history'))}
          />
          {isDefferedLoading ? (
            <InputGroupAddon align="inline-end">
              <Spinner />
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </div>
      <TrackTable
        enableSorting={false}
        queueGroupId={queueId}
        tracks={tracks}
        hideAddedAtColumn={false}
        tableBody={
          <VirtualTableBody query={query} rowKeyGenerator={rowKeyGenerator} />
        }
      />
      {!tracks.length ? (
        <MediaPageNoResultsMessage
          className="mt-8.5"
          searchQuery={searchQuery}
          description={<Trans message="You have not played any songs yet." />}
        />
      ) : null}
      <AdHost slot="general_bottom" className="mt-8.5" />
    </div>
  );
}
