import {CreateLyricDialog} from '@app/admin/lyrics-datatable-page/create-lyric-dialog';
import {LyricDatatablePageFilters} from '@app/admin/lyrics-datatable-page/lyric-datatable-page-filters';
import {
  LyricActionsButton,
  lyricsDatatableColumns,
} from '@app/admin/lyrics-datatable-page/lyrics-datatable-columns';
import {appQueries} from '@app/app-queries';
import {Lyric} from '@app/web-player/tracks/lyrics/lyric';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
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
import {Trans} from '@ui/i18n/trans';
import {CaptionsIcon, PlusIcon} from 'lucide-react';
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
  } = useTableQueryState({filters: LyricDatatablePageFilters});

  const query = useSuspenseQuery(appQueries.lyrics.index(deferredSearchParams));
  const items = query.data?.pagination.data ?? [];

  const table = useTable({
    data: items,
    columns: lyricsDatatableColumns,
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
        <Trans message="Lyrics" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Lyrics" />
          </h1>
        </DashboardLayout.SectionTitle>
        <AddNewLyricButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={LyricDatatablePageFilters}
            className="mr-auto"
          />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={LyricDatatablePageFilters} />
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobileLyricsList lyrics={items} />
          ) : (
            <GenericTable table={table} />
          )}

          {!items.length && <LyricsEmptyState isFiltering={isFiltering} />}

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
        <DeleteLyricsDialog
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

interface DeleteLyricsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteLyricsDialog({selectedIds, onDelete}: DeleteLyricsDialogProps) {
  const deleteSelectedLyrics = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete(`lyrics/${ids.join(',')}`),
  });

  const handleDelete = () => {
    deleteSelectedLyrics.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Lyrics deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: appQueries.lyrics.invalidateKey,
        });
        queryClient.invalidateQueries({
          queryKey: appQueries.tracks.invalidateKey,
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
            <CaptionsIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete lyrics" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected lyrics?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedLyrics.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedLyrics.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function AddNewLyricButton() {
  return (
    <CreateLyricDialog>
      <Dialog.Trigger render={<Button variant="default" color="primary" />}>
        <PlusIcon />
        <Trans message="Add new lyric" />
      </Dialog.Trigger>
    </CreateLyricDialog>
  );
}

function LyricsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <CaptionsIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching lyrics" />
          ) : (
            <Trans message="No lyrics have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : (
            <Trans message="Get started by creating your first lyric." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <AddNewLyricButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

function MobileLyricsList({lyrics}: {lyrics: Lyric[]}) {
  return (
    <Item.Group>
      {lyrics.map(lyric => (
        <Item.Root key={lyric.id} variant="outline">
          {lyric.track ? (
            <Item.Media>
              <TrackImage
                track={lyric.track}
                className="shrink-0 rounded-md"
                size="size-10"
              />
            </Item.Media>
          ) : null}
          <Item.Content>
            <Item.Title>{lyric.track?.name}</Item.Title>
            <Item.Row className="text-muted-foreground mt-1 gap-2 text-sm">
              {lyric.track?.album ? (
                <span>{lyric.track.album.name}</span>
              ) : null}
              {lyric.updated_at ? (
                <span>
                  <FormattedDate date={lyric.updated_at} />
                </span>
              ) : null}
            </Item.Row>
          </Item.Content>
          <Item.Actions className="shrink-0 md:ml-0">
            <LyricActionsButton lyric={lyric} />
          </Item.Actions>
        </Item.Root>
      ))}
    </Item.Group>
  );
}
