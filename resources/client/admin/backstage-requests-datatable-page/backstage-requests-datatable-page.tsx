import {AdminDocsUrls} from '@app/admin/admin-config';
import {BackstageRequestDatatableFilters} from '@app/admin/backstage-requests-datatable-page/backstage-request-datatable-filters';
import {
  BackstageRequestActionsButton,
  backstageRequestsDatatableColumns,
  RequestStatusBadge,
} from '@app/admin/backstage-requests-datatable-page/backstage-requests-datatable-columns';
import {appQueries} from '@app/app-queries';
import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {DocsLink} from '@common/admin/settings/layout/settings-links';
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
import {Trans} from '@ui/i18n/trans';
import {ClipboardCheckIcon} from 'lucide-react';
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
  } = useTableQueryState({filters: BackstageRequestDatatableFilters});

  const query = useSuspenseQuery(
    appQueries.backstageRequests.index(deferredSearchParams as any),
  );
  const items = query.data?.pagination.data ?? [];

  const table = useTable({
    data: items,
    columns: backstageRequestsDatatableColumns,
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
        <Trans message="Backstage requests" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Backstage requests" />
          </h1>
        </DashboardLayout.SectionTitle>
        <DocsLink
          variant="button"
          link={AdminDocsUrls.pages.backstage}
          size="sm"
        />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={BackstageRequestDatatableFilters}
            className="mr-auto"
          />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={BackstageRequestDatatableFilters} />
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobileRequestsList requests={items} />
          ) : (
            <GenericTable
              table={table}
              onRowClick={row => {
                navigate(`/admin/backstage-requests/${row.original.id}`);
              }}
            />
          )}

          {!items.length && <RequestsEmptyState isFiltering={isFiltering} />}

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
        <DeleteRequestsDialog
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

interface DeleteRequestsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteRequestsDialog({
  selectedIds,
  onDelete,
}: DeleteRequestsDialogProps) {
  const deleteSelectedRequests = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete(`backstage-request/${ids.join(',')}`),
  });

  const handleDelete = () => {
    deleteSelectedRequests.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Requests deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: appQueries.backstageRequests.invalidateKey,
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
            <ClipboardCheckIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete requests" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected requests?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedRequests.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedRequests.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function RequestsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <ClipboardCheckIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching requests" />
          ) : (
            <Trans message="No requests have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : null}
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  );
}

function MobileRequestsList({requests}: {requests: BackstageRequest[]}) {
  return (
    <Item.Group>
      {requests.map(request => (
        <Item.Root key={request.id} variant="outline">
          <Item.Media>
            <Avatar.Root className="size-10">
              <Avatar.Image
                src={request.user?.image ?? undefined}
                alt={request.user?.name}
              />
              <Avatar.ColorFallback>{request.user?.name}</Avatar.ColorFallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>{request.user?.name ?? request.artist_name}</Item.Title>
            <Item.Row className="text-muted-foreground mt-1 gap-2 text-sm">
              <RequestStatusBadge status={request.status} />
              {request.created_at ? (
                <span>
                  <FormattedDate date={request.created_at} />
                </span>
              ) : null}
            </Item.Row>
          </Item.Content>
          <Item.Actions className="shrink-0 md:ml-0">
            <BackstageRequestActionsButton request={request} />
          </Item.Actions>
        </Item.Root>
      ))}
    </Item.Group>
  );
}
