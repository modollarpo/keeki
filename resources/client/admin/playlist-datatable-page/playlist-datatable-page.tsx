import {ImportPlaylistDialog} from '@app/admin/playlist-datatable-page/import-playlist-dialog';
import {
  getPlaylistOwner,
  PlaylistActionsButton,
  playlistDatatableColumns,
} from '@app/admin/playlist-datatable-page/playlist-datatable-columns';
import {PlaylistDatatableFilters} from '@app/admin/playlist-datatable-page/playlist-datatable-filters';
import {appQueries} from '@app/app-queries';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {useShowGlobalLoadingBar} from '@common/core/use-show-global-loading-bar';
import {AddFilterPopover} from '@common/datatable/filters/add-filter-popover';
import {FilterList} from '@common/datatable/filters/filter-list/filter-list';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Button} from '@shadcn/button/button';
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
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {DownloadIcon, ListMusicIcon, PlusIcon} from 'lucide-react';
import {use, useState} from 'react';

export function Component() {
  const {isMobileMode} = use(DashboardLayoutContext);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const {
    queryState,
    setQueryState,
    deferredSearchParams,
    isFiltering,
    isLoading,
  } = useTableQueryState({filters: PlaylistDatatableFilters});

  const query = useSuspenseQuery(
    appQueries.playlists.index(deferredSearchParams as any),
  );
  const items = query.data?.pagination.data ?? [];

  const table = useTable({
    data: items,
    columns: playlistDatatableColumns,
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
        <Trans message="Playlists" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Playlists" />
          </h1>
        </DashboardLayout.SectionTitle>
        <AddNewPlaylistButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={PlaylistDatatableFilters}
            className="mr-auto"
          />
          <ImportPlaylistButton />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={PlaylistDatatableFilters} />
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobilePlaylistsList playlists={items} />
          ) : (
            <GenericTable table={table} />
          )}

          {!items.length && <PlaylistsEmptyState isFiltering={isFiltering} />}

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
        <DeletePlaylistsDialog
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

interface DeletePlaylistsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeletePlaylistsDialog({
  selectedIds,
  onDelete,
}: DeletePlaylistsDialogProps) {
  const deleteSelectedPlaylists = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete(`playlists/${ids.join(',')}`),
  });

  const handleDelete = () => {
    deleteSelectedPlaylists.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Playlists deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: appQueries.playlists.invalidateKey,
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
            <ListMusicIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete playlists" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected playlists?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedPlaylists.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedPlaylists.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function AddNewPlaylistButton() {
  return (
    <CreatePlaylistDialog>
      <Dialog.Trigger render={<Button variant="default" color="primary" />}>
        <PlusIcon />
        <Trans message="Create new playlist" />
      </Dialog.Trigger>
    </CreatePlaylistDialog>
  );
}

function ImportPlaylistButton() {
  return (
    <ImportPlaylistDialog>
      <Dialog.Trigger render={<Button variant="outline" />}>
        <DownloadIcon />
        <Trans message="Import playlist" />
      </Dialog.Trigger>
    </ImportPlaylistDialog>
  );
}

function PlaylistsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <ListMusicIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching playlists" />
          ) : (
            <Trans message="No playlists have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : (
            <Trans message="Get started by creating your first playlist." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <AddNewPlaylistButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

function MobilePlaylistsList({playlists}: {playlists: FullPlaylist[]}) {
  return (
    <Item.Group>
      {playlists.map(playlist => {
        const owner = getPlaylistOwner(playlist);
        return (
          <Item.Root key={playlist.id} variant="outline">
            <Item.Media>
              <PlaylistImage
                playlist={playlist}
                className="shrink-0"
                size="size-10 rounded-md"
              />
            </Item.Media>
            <Item.Content>
              <Item.Title>{playlist.name}</Item.Title>
              <Item.Row className="text-muted-foreground mt-1 gap-2 text-sm">
                {owner ? <span>{owner.name}</span> : null}
                {playlist.views ? (
                  <span>
                    <FormattedNumber value={playlist.views} />{' '}
                    <Trans message="views" />
                  </span>
                ) : null}
              </Item.Row>
            </Item.Content>
            <Item.Actions className="shrink-0 md:ml-0">
              <PlaylistActionsButton playlist={playlist} />
            </Item.Actions>
          </Item.Root>
        );
      })}
    </Item.Group>
  );
}
