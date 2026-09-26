import {CreateTagDialog} from '@app/admin/tags-datatable-page/create-tag-dialog';
import {TagDatatablePageFilters} from '@app/admin/tags-datatable-page/tag-datatable-page-filters';
import {
  TagActionsButton,
  tagsDatatableColumns,
} from '@app/admin/tags-datatable-page/tags-datatable-columns';
import {appQueries} from '@app/app-queries';
import {Tag} from '@app/web-player/tags/tag';
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
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {PlusIcon, TagIcon} from 'lucide-react';
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
  } = useTableQueryState({filters: TagDatatablePageFilters});

  const query = useSuspenseQuery(appQueries.tags.index(deferredSearchParams));
  const items = query.data?.data ?? [];

  const table = useTable({
    data: items,
    columns: tagsDatatableColumns,
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
        <Trans message="Tags" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Tags" />
          </h1>
        </DashboardLayout.SectionTitle>
        <AddNewTagButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={TagDatatablePageFilters}
            className="mr-auto"
          />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={TagDatatablePageFilters} />
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobileTagsList tags={items} />
          ) : (
            <GenericTable table={table} />
          )}

          {!items.length && <TagsEmptyState isFiltering={isFiltering} />}

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
        <DeleteTagsDialog
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

interface DeleteTagsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteTagsDialog({selectedIds, onDelete}: DeleteTagsDialogProps) {
  const deleteSelectedTags = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete('tags/bulk', {params: {ids: ids.join(',')}}),
  });

  const handleDelete = () => {
    deleteSelectedTags.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Tags deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: appQueries.tags.invalidateKey,
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
            <TagIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete tags" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected tags?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedTags.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedTags.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function AddNewTagButton() {
  return (
    <CreateTagDialog>
      <Dialog.Trigger render={<Button variant="default" color="primary" />}>
        <PlusIcon />
        <Trans message="Add new tag" />
      </Dialog.Trigger>
    </CreateTagDialog>
  );
}

function TagsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <TagIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching tags" />
          ) : (
            <Trans message="No tags have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : (
            <Trans message="Get started by creating your first tag." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <AddNewTagButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

function MobileTagsList({tags}: {tags: Tag[]}) {
  return (
    <Item.Group>
      {tags.map(tag => (
        <Item.Root key={tag.id} variant="outline">
          <Item.Content>
            <Item.Title>{tag.display_name || tag.name}</Item.Title>
            <Item.Row className="text-muted-foreground mt-1 gap-2 text-sm">
              {tag.tracks_count != null && (
                <span>
                  <FormattedNumber value={tag.tracks_count} />{' '}
                  <Trans message="tracks" />
                </span>
              )}
              {tag.albums_count != null && (
                <span>
                  <FormattedNumber value={tag.albums_count} />{' '}
                  <Trans message="albums" />
                </span>
              )}
              {tag.updated_at ? (
                <span>
                  <FormattedDate date={tag.updated_at} />
                </span>
              ) : null}
            </Item.Row>
          </Item.Content>
          <Item.Actions className="shrink-0 md:ml-0">
            <TagActionsButton tag={tag} />
          </Item.Actions>
        </Item.Root>
      ))}
    </Item.Group>
  );
}
