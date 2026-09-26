import {CreateGenreDialog} from '@app/admin/genres-datatable-page/create-genre-dialog';
import {GenreDatatablePageFilters} from '@app/admin/genres-datatable-page/genre-datatable-page-filters';
import {
  GenreActionsButton,
  genresDatatableColumns,
  TableGenre,
} from '@app/admin/genres-datatable-page/genres-datatable-columns';
import {appQueries} from '@app/app-queries';
import {useShowGlobalLoadingBar} from '@common/core/use-show-global-loading-bar';
import {AddFilterPopover} from '@common/datatable/filters/add-filter-popover';
import {FilterList} from '@common/datatable/filters/filter-list/filter-list';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Avatar} from '@shadcn/avatar/avatar';
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
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {PlusIcon, TagsIcon} from 'lucide-react';
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
  } = useTableQueryState({filters: GenreDatatablePageFilters});

  const query = useSuspenseQuery(appQueries.genres.index(deferredSearchParams));
  const items = (query.data?.pagination.data ?? []) as TableGenre[];

  const table = useTable({
    data: items,
    columns: genresDatatableColumns,
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
        <Trans message="Genres" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Genres" />
          </h1>
        </DashboardLayout.SectionTitle>
        <AddNewGenreButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={GenreDatatablePageFilters}
            className="mr-auto"
          />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={GenreDatatablePageFilters} />
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobileGenresList genres={items} />
          ) : (
            <GenericTable table={table} />
          )}

          {!items.length && <GenresEmptyState isFiltering={isFiltering} />}

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
        <DeleteGenresDialog
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

interface DeleteGenresDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteGenresDialog({selectedIds, onDelete}: DeleteGenresDialogProps) {
  const deleteSelectedGenres = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete(`genres/${ids.join(',')}`),
  });

  const handleDelete = () => {
    deleteSelectedGenres.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Genres deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: appQueries.genres.invalidateKey,
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
            <TagsIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete genres" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected genres?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedGenres.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedGenres.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function AddNewGenreButton() {
  return (
    <CreateGenreDialog>
      <Dialog.Trigger render={<Button variant="default" color="primary" />}>
        <PlusIcon />
        <Trans message="Add new genre" />
      </Dialog.Trigger>
    </CreateGenreDialog>
  );
}

function GenresEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <TagsIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching genres" />
          ) : (
            <Trans message="No genres have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : (
            <Trans message="Get started by creating your first genre." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <AddNewGenreButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

function MobileGenresList({genres}: {genres: TableGenre[]}) {
  return (
    <Item.Group>
      {genres.map(genre => (
        <Item.Root key={genre.id} variant="outline">
          <Item.Media>
            <Avatar.Root className="size-10">
              <Avatar.Image src={genre.image ?? undefined} alt={genre.name} />
              <Avatar.ColorFallback>{genre.name}</Avatar.ColorFallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>{genre.display_name || genre.name}</Item.Title>
            <Item.Row className="text-muted-foreground mt-1 gap-2 text-sm">
              {genre.artists_count != null && (
                <span>
                  <FormattedNumber value={genre.artists_count} />{' '}
                  <Trans message="artists" />
                </span>
              )}
              {genre.updated_at ? (
                <span>
                  <FormattedDate date={genre.updated_at} />
                </span>
              ) : null}
            </Item.Row>
          </Item.Content>
          <Item.Actions className="shrink-0 md:ml-0">
            <GenreActionsButton genre={genre} />
          </Item.Actions>
        </Item.Root>
      ))}
    </Item.Group>
  );
}
