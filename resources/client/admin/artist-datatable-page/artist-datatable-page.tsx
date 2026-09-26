import {
  ArtistActionsButton,
  artistDatatableColumns,
} from '@app/admin/artist-datatable-page/artist-datatable-columns';
import {ArtistDatatableFilters} from '@app/admin/artist-datatable-page/artist-datatable-filters';
import {ImportArtistDialog} from '@app/admin/artist-datatable-page/import-artist-dialog';
import {appQueries} from '@app/app-queries';
import {FullArtist} from '@app/web-player/artists/artist';
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
import {DownloadIcon, EyeOffIcon, MicVocalIcon, PlusIcon} from 'lucide-react';
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
  } = useTableQueryState({filters: ArtistDatatableFilters});

  const query = useSuspenseQuery(
    appQueries.artists.index(deferredSearchParams as any),
  );
  const items = query.data?.pagination.data ?? [];

  const table = useTable({
    data: items,
    columns: artistDatatableColumns,
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
        <Trans message="Artists" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Artists" />
          </h1>
        </DashboardLayout.SectionTitle>
        <AddNewArtistButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={ArtistDatatableFilters}
            className="mr-auto"
          />
          <ImportArtistButton />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={ArtistDatatableFilters} />
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobileArtistsList artists={items} />
          ) : (
            <GenericTable
              table={table}
              onRowClick={row => {
                navigate(`/admin/artists/${row.original.id}/edit`);
              }}
            />
          )}

          {!items.length && <ArtistsEmptyState isFiltering={isFiltering} />}

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
        <DeleteArtistsDialog
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

interface DeleteArtistsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteArtistsDialog({
  selectedIds,
  onDelete,
}: DeleteArtistsDialogProps) {
  const deleteSelectedArtists = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete(`artists/${ids.join(',')}`),
  });

  const handleDelete = () => {
    deleteSelectedArtists.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Artists deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: DatatableDataQueryKey('artists'),
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
            <MicVocalIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete artists" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected artists?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedArtists.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedArtists.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function AddNewArtistButton() {
  return (
    <LinkButton variant="default" color="primary" to="new">
      <PlusIcon />
      <Trans message="Create new artist" />
    </LinkButton>
  );
}

function ImportArtistButton() {
  const navigate = useNavigate();

  return (
    <ImportArtistDialog
      onImported={artist => {
        navigate(`/admin/artists/${artist.id}/edit`);
      }}
    >
      <Dialog.Trigger render={<Button variant="outline" />}>
        <DownloadIcon />
        <Trans message="Import artist" />
      </Dialog.Trigger>
    </ImportArtistDialog>
  );
}

function ArtistsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <MicVocalIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching artists" />
          ) : (
            <Trans message="No artists have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : (
            <Trans message="Get started by creating your first artist." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <AddNewArtistButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

function MobileArtistsList({artists}: {artists: FullArtist[]}) {
  return (
    <Item.Group>
      {artists.map(artist => (
        <Item.Root key={artist.id} variant="outline">
          <Item.Media>
            <Avatar.Root className="size-10">
              <Avatar.Image
                src={artist.image_small ?? undefined}
                alt={artist.name}
              />
              <Avatar.ColorFallback>{artist.name}</Avatar.ColorFallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title className="flex items-center gap-2">
              {artist.name}
              {artist.disabled ? (
                <EyeOffIcon className="text-muted-foreground size-4" />
              ) : null}
            </Item.Title>
            <Item.Row className="text-muted-foreground mt-1 gap-2 text-sm">
              {artist.albums_count != null && (
                <span>
                  <FormattedNumber value={artist.albums_count} />{' '}
                  <Trans message="albums" />
                </span>
              )}
              {artist.plays ? (
                <span>
                  <FormattedNumber value={artist.plays} />{' '}
                  <Trans message="plays" />
                </span>
              ) : null}
            </Item.Row>
          </Item.Content>
          <Item.Actions className="shrink-0 md:ml-0">
            <ArtistActionsButton artist={artist} />
          </Item.Actions>
        </Item.Root>
      ))}
    </Item.Group>
  );
}
