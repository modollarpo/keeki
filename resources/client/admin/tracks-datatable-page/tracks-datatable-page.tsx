import {ImportTrackDialog} from '@app/admin/tracks-datatable-page/import-track-dialog';
import {
  TrackActionsButton,
  tracksDatatableColumns,
} from '@app/admin/tracks-datatable-page/tracks-datatable-columns';
import {TracksDatatableFilters} from '@app/admin/tracks-datatable-page/tracks-datatable-filters';
import {appQueries} from '@app/app-queries';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {useShowGlobalLoadingBar} from '@common/core/use-show-global-loading-bar';
import {AddFilterPopover} from '@common/datatable/filters/add-filter-popover';
import {FilterList} from '@common/datatable/filters/filter-list/filter-list';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Button, LinkButton} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Empty} from '@shadcn/empty/empty';
import {Item} from '@shadcn/item/item';
import {GenericTable} from '@shadcn/table/generic-table';
import {BackendPagination} from '@shadcn/table/utils/table-pagination';
import {TableSearchInput} from '@shadcn/table/utils/table-search-input';
import {useTable} from '@shadcn/table/utils/use-table';
import {useTableQueryState} from '@shadcn/table/utils/use-table-query-state';
import {toast} from '@shadcn/toast/toast';
import {useMutation, useSuspenseQuery} from '@tanstack/react-query';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {DownloadIcon, MusicIcon, PlusIcon} from 'lucide-react';
import {use, useState} from 'react';
import {useNavigate} from 'react-router';

export function Component() {
  const navigate = useNavigate();
  const {isMobileMode} = use(DashboardLayoutContext);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const {
    queryState,
    setQueryState,
    deferredSearchParams,
    isFiltering,
    isLoading,
  } = useTableQueryState({filters: TracksDatatableFilters});

  const query = useSuspenseQuery(
    appQueries.tracks.index(deferredSearchParams as any),
  );
  const items = query.data?.pagination.data ?? [];

  const table = useTable({
    data: items,
    columns: tracksDatatableColumns,
    enableMultiRowSelection: true,
    sort: queryState.sort,
    onSortChange: sort => setQueryState({sort}),
    selectedRows,
    onSelectedRowsChange: setSelectedRows,
    pagination: {
      per_page: queryState.per_page,
      page: queryState.page,
    },
    onPaginationChange: pagination => setQueryState({...pagination}),
    response: query.data,
  });

  useShowGlobalLoadingBar({isLoading});

  return (
    <DashboardLayout.MainSection>
      <StaticPageTitle>
        <Trans message="Tracks" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Tracks" />
          </h1>
        </DashboardLayout.SectionTitle>
        <AddNewTrackButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={TracksDatatableFilters}
            className="mr-auto"
          />
          <ImportTrackButton />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={TracksDatatableFilters} />
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobileTracksList tracks={items} />
          ) : (
            <GenericTable
              table={table}
              onRowClick={row => {
                navigate(`/admin/tracks/${row.original.id}/edit`);
              }}
            />
          )}

          {!items.length && <TracksEmptyState isFiltering={isFiltering} />}

          <BackendPagination
            response={query.data}
            disabled={isLoading}
            onPageChange={page => setQueryState({page})}
            onPageSizeChange={perPage => setQueryState({per_page: perPage})}
          />
        </DashboardLayout.SectionScrollContainer>
      </DashboardLayout.SectionContent>
      <SelectedActionsToolbar
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
      />
    </DashboardLayout.MainSection>
  );
}

function SelectedActionsToolbar({
  selectedRows,
  setSelectedRows,
}: {
  selectedRows: number[];
  setSelectedRows: (rows: number[]) => void;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!selectedRows.length) {
    return null;
  }

  return (
    <DashboardLayout.FloatingActions
      selectedItemsCount={selectedRows.length}
      onClear={() => setSelectedRows([])}
    >
      <AlertDialog.Root
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialog.Trigger
          render={<Button variant="outline" color="danger" />}
        >
          <Trans message="Delete" />
        </AlertDialog.Trigger>
        <DeleteTracksDialog
          selectedIds={selectedRows}
          onDelete={() => {
            setSelectedRows([]);
            setIsDeleteDialogOpen(false);
          }}
        />
      </AlertDialog.Root>
    </DashboardLayout.FloatingActions>
  );
}

interface DeleteTracksDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteTracksDialog({
  selectedIds,
  onDelete,
}: DeleteTracksDialogProps) {
  const deleteSelectedTracks = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete(`tracks/${ids.join(',')}`),
  });

  const handleDelete = () => {
    deleteSelectedTracks.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Tracks deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: DatatableDataQueryKey('tracks'),
        });
      },
      onError: err => showHttpErrorToast(err),
    });
  };

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop />
      <AlertDialog.Content size="sm">
        <AlertDialog.Header>
          <AlertDialog.Media>
            <MusicIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete tracks" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected tracks?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedTracks.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedTracks.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function AddNewTrackButton() {
  return (
    <LinkButton variant="default" color="primary" to="new">
      <PlusIcon />
      <Trans message="Create new track" />
    </LinkButton>
  );
}

function ImportTrackButton() {
  const navigate = useNavigate();

  return (
    <ImportTrackDialog
      onImported={track => {
        navigate(`/admin/tracks/${track.id}/edit`);
      }}
    >
      <Dialog.Trigger render={<Button variant="outline" />}>
        <DownloadIcon />
        <Trans message="Import track" />
      </Dialog.Trigger>
    </ImportTrackDialog>
  );
}

function TracksEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <MusicIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching tracks" />
          ) : (
            <Trans message="No tracks have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : (
            <Trans message="Get started by creating your first track." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <AddNewTrackButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

function MobileTracksList({tracks}: {tracks: Track[]}) {
  return (
    <Item.Group>
      {tracks.map(track => {
        const artist = track.artists?.[0];
        return (
          <Item.Root key={track.id} variant="outline">
            <Item.Media>
              <TrackImage
                track={track}
                className="shrink-0 rounded-md"
                size="size-10"
              />
            </Item.Media>
            <Item.Content>
              <Item.Title>{track.name}</Item.Title>
              <Item.Row className="text-muted-foreground mt-1 gap-2 text-sm">
                {artist ? <span>{artist.name}</span> : null}
                {track.duration ? (
                  <span>
                    <FormattedDuration ms={track.duration} />
                  </span>
                ) : null}
                {track.plays ? (
                  <span>
                    <FormattedNumber value={track.plays} />{' '}
                    <Trans message="plays" />
                  </span>
                ) : null}
              </Item.Row>
            </Item.Content>
            <Item.Actions className="shrink-0 md:ml-0">
              <TrackActionsButton track={track} />
            </Item.Actions>
          </Item.Root>
        );
      })}
    </Item.Group>
  );
}
