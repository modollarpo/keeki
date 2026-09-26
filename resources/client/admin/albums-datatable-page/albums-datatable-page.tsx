import {
  AlbumActionsButton,
  albumsDatatableColumns,
} from '@app/admin/albums-datatable-page/albums-datatable-columns';
import {AlbumsDatatableFilters} from '@app/admin/albums-datatable-page/albums-datatable-filters';
import {ImportAlbumDialog} from '@app/admin/albums-datatable-page/import-album-dialog';
import {appQueries} from '@app/app-queries';
import {FullAlbum} from '@app/web-player/albums/album';
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
import {Avatar} from '@shadcn/avatar/avatar';
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
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {Disc3Icon, DownloadIcon, PlusIcon} from 'lucide-react';
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
  } = useTableQueryState({filters: AlbumsDatatableFilters});

  const query = useSuspenseQuery(
    appQueries.albums.index(deferredSearchParams as any),
  );
  const items = query.data?.pagination.data ?? [];

  const table = useTable({
    data: items,
    columns: albumsDatatableColumns,
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
        <Trans message="Albums" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Albums" />
          </h1>
        </DashboardLayout.SectionTitle>
        <AddNewAlbumButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={AlbumsDatatableFilters}
            className="mr-auto"
          />
          <ImportAlbumButton />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={AlbumsDatatableFilters} />
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobileAlbumsList albums={items} />
          ) : (
            <GenericTable
              table={table}
              onRowClick={row => {
                navigate(`/admin/albums/${row.original.id}/edit`);
              }}
            />
          )}

          {!items.length && <AlbumsEmptyState isFiltering={isFiltering} />}

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
        <DeleteAlbumsDialog
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

interface DeleteAlbumsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteAlbumsDialog({
  selectedIds,
  onDelete,
}: DeleteAlbumsDialogProps) {
  const deleteSelectedAlbums = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete(`albums/${ids.join(',')}`),
  });

  const handleDelete = () => {
    deleteSelectedAlbums.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Albums deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: DatatableDataQueryKey('albums'),
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
            <Disc3Icon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete albums" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected albums?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedAlbums.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedAlbums.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function AddNewAlbumButton() {
  return (
    <LinkButton variant="default" color="primary" to="new">
      <PlusIcon />
      <Trans message="Create new album" />
    </LinkButton>
  );
}

function ImportAlbumButton() {
  const navigate = useNavigate();

  return (
    <ImportAlbumDialog
      onImported={album => {
        navigate(`/admin/albums/${album.id}/edit`);
      }}
    >
      <Dialog.Trigger render={<Button variant="outline" />}>
        <DownloadIcon />
        <Trans message="Import album" />
      </Dialog.Trigger>
    </ImportAlbumDialog>
  );
}

function AlbumsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <Disc3Icon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching albums" />
          ) : (
            <Trans message="No albums have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : (
            <Trans message="Get started by creating your first album." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <AddNewAlbumButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

function MobileAlbumsList({albums}: {albums: FullAlbum[]}) {
  return (
    <Item.Group>
      {albums.map(album => {
        const artist = album.artists?.[0];
        return (
          <Item.Root key={album.id} variant="outline">
            <Item.Media>
              <Avatar.Root className="size-10">
                <Avatar.Image src={album.image ?? undefined} alt={album.name} />
                <Avatar.ColorFallback>{album.name}</Avatar.ColorFallback>
              </Avatar.Root>
            </Item.Media>
            <Item.Content>
              <Item.Title>{album.name}</Item.Title>
              <Item.Row className="text-muted-foreground mt-1 gap-2 text-sm">
                {artist ? <span>{artist.name}</span> : null}
                {album.tracks_count != null && (
                  <span>
                    <FormattedNumber value={album.tracks_count} />{' '}
                    <Trans message="tracks" />
                  </span>
                )}
                {album.plays ? (
                  <span>
                    <FormattedNumber value={album.plays} />{' '}
                    <Trans message="plays" />
                  </span>
                ) : null}
              </Item.Row>
            </Item.Content>
            <Item.Actions className="shrink-0 md:ml-0">
              <AlbumActionsButton album={album} />
            </Item.Actions>
          </Item.Root>
        );
      })}
    </Item.Group>
  );
}
