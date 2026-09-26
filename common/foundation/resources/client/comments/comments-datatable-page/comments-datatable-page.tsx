import {commentQueries} from '@common/comments/comment-queries';
import {Commentable} from '@common/comments/commentable';
import {CommentDatatableItem} from '@common/comments/comments-datatable-page/comment-datatable-item';
import {CommentsDatatableFilters} from '@common/comments/comments-datatable-page/comments-datatable-filters';
import {DeleteCommentsButton} from '@common/comments/comments-datatable-page/delete-comments-button';
import {useShowGlobalLoadingBar} from '@common/core/use-show-global-loading-bar';
import {AddFilterPopover} from '@common/datatable/filters/add-filter-popover';
import {FilterList} from '@common/datatable/filters/filter-list/filter-list';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {Empty} from '@shadcn/empty/empty';
import {Item} from '@shadcn/item/item';
import {BackendPagination} from '@shadcn/table/utils/table-pagination';
import {TableSearchInput} from '@shadcn/table/utils/table-search-input';
import {useTableQueryState} from '@shadcn/table/utils/use-table-query-state';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {MessageCircleIcon} from 'lucide-react';
import {useMemo, useState} from 'react';

interface Props {
  hideTitle?: boolean;
  commentable?: Commentable;
}

export function Component({hideTitle, commentable}: Props) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const {setQueryState, deferredSearchParams, isFiltering, isLoading} =
    useTableQueryState({filters: CommentsDatatableFilters});

  const queryParams = useMemo(() => {
    const params = {...deferredSearchParams};
    if (commentable) {
      params.commentable_id = `${commentable.id}`;
      params.commentable_type = commentable.model_type;
    }
    return params;
  }, [deferredSearchParams, commentable]);

  const query = useSuspenseQuery(commentQueries.index(queryParams));
  const items = query.data?.pagination.data ?? [];

  useShowGlobalLoadingBar({isLoading});

  return (
    <DashboardLayout.MainSection>
      <StaticPageTitle>
        <Trans message="Comments" />
      </StaticPageTitle>
      {!hideTitle && (
        <DashboardLayout.SectionHeader>
          <DashboardLayout.SidebarToggle />
          <DashboardLayout.SectionTitle>
            <h1>
              <Trans message="Comments" />
            </h1>
          </DashboardLayout.SectionTitle>
        </DashboardLayout.SectionHeader>
      )}
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput />
          <AddFilterPopover
            filters={CommentsDatatableFilters}
            className="mr-auto"
          />
        </DashboardLayout.SectionContentHeader>
        <FilterList filters={CommentsDatatableFilters} />
        <DashboardLayout.SectionScrollContainer>
          {items.length ? (
            <Item.Group>
              {items.map(comment => (
                <CommentDatatableItem
                  key={comment.id}
                  comment={comment}
                  isSelected={selectedRows.includes(comment.id)}
                  onToggle={() => {
                    setSelectedRows(prev =>
                      prev.includes(comment.id)
                        ? prev.filter(id => id !== comment.id)
                        : [...prev, comment.id],
                    );
                  }}
                  onDelete={() => setSelectedRows([])}
                />
              ))}
            </Item.Group>
          ) : (
            <CommentsEmptyState isFiltering={isFiltering} />
          )}

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
  if (!selectedRows.length) {
    return null;
  }

  return (
    <DashboardLayout.FloatingActions
      selectedItemsCount={selectedRows.length}
      onClear={() => setSelectedRows([])}
    >
      <DeleteCommentsButton
        commentIds={selectedRows}
        onDelete={() => setSelectedRows([])}
      />
    </DashboardLayout.FloatingActions>
  );
}

function CommentsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <MessageCircleIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching comments" />
          ) : (
            <Trans message="No comments have been created yet" />
          )}
        </Empty.Title>
        {isFiltering ? (
          <Empty.Description>
            <Trans message="Try another search query or different filters." />
          </Empty.Description>
        ) : null}
      </Empty.Header>
    </Empty.Root>
  );
}
