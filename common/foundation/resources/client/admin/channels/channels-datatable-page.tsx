import {
  ChannelActionsButton,
  channelsDatatableColumns,
} from '@common/admin/channels/channels-datatable-columns';
import {ChannelsDocsLink} from '@common/admin/channels/channels-docs-link';
import {useApplyChannelPreset} from '@common/admin/channels/requests/use-apply-channel-preset';
import {Channel} from '@common/channels/channel';
import {channelQueries} from '@common/channels/channel-queries';
import {useShowGlobalLoadingBar} from '@common/core/use-show-global-loading-bar';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Badge} from '@shadcn/badge/badge';
import {Button, LinkButton} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
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
import {ChevronDownIcon, PlusIcon, RadioIcon} from 'lucide-react';
import {use, useState} from 'react';
import {useNavigate} from 'react-router';

interface ChannelPresetConfig {
  preset: string;
  name: string;
  description: string;
}

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
  } = useTableQueryState();

  const query = useSuspenseQuery(
    channelQueries.index(deferredSearchParams as any),
  );
  const items = query.data?.pagination.data ?? [];
  const presets = query.data?.presets as ChannelPresetConfig[] | undefined;

  const table = useTable({
    data: items,
    columns: channelsDatatableColumns,
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
        <Trans message="Channels" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Channels" />
          </h1>
        </DashboardLayout.SectionTitle>
        <ChannelsDocsLink variant="button" size="default" />
        <AddNewChannelButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput className="mr-auto" />
          <ApplyPresetButton presets={presets} />
        </DashboardLayout.SectionContentHeader>
        <DashboardLayout.SectionScrollContainer>
          {isMobileMode ? (
            <MobileChannelsList channels={items} />
          ) : (
            <GenericTable
              table={table}
              onRowClick={row => {
                navigate(`/admin/channels/${row.original.id}/edit`);
              }}
            />
          )}

          {!items.length && <ChannelsEmptyState isFiltering={isFiltering} />}

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
        <DeleteChannelsDialog
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

interface DeleteChannelsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteChannelsDialog({
  selectedIds,
  onDelete,
}: DeleteChannelsDialogProps) {
  const deleteSelectedChannels = useMutation({
    mutationFn: (ids: (number | string)[]) =>
      apiClient.delete(`channel/${ids.join(',')}`),
  });

  const handleDelete = () => {
    deleteSelectedChannels.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(<Trans message="Channels deleted" />);
        onDelete();
        queryClient.invalidateQueries({
          queryKey: channelQueries.invalidateKey,
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
            <RadioIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Delete channels" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to delete selected channels?" />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={deleteSelectedChannels.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={deleteSelectedChannels.isPending}
            onClick={() => handleDelete()}
          >
            <Trans message="Delete" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function AddNewChannelButton() {
  return (
    <LinkButton variant="default" color="primary" to="new">
      <PlusIcon />
      <Trans message="Add new channel" />
    </LinkButton>
  );
}

function ApplyPresetButton({
  presets,
}: {
  presets: ChannelPresetConfig[] | undefined;
}) {
  const [presetToApply, setPresetToApply] = useState<string | null>(null);

  return (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger
          render={<Button variant="outline" />}
          disabled={!presets?.length}
        >
          <Trans message="Apply preset" />
          <ChevronDownIcon data-icon="inline-end" />
        </Dropdown.Trigger>
        <Dropdown.Content align="end" className="w-72">
          {presets?.map(preset => (
            <Dropdown.Item
              key={preset.preset}
              onClick={() => setPresetToApply(preset.preset)}
            >
              <div className="flex flex-col gap-0.5">
                <span>
                  <Trans message={preset.name} />
                </span>
                <span className="text-muted-foreground text-xs font-normal">
                  <Trans message={preset.description} />
                </span>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Root>
      <AlertDialog.Root
        open={presetToApply != null}
        onOpenChange={open => {
          if (!open) {
            setPresetToApply(null);
          }
        }}
      >
        {presetToApply ? (
          <ApplyPresetDialog
            preset={presetToApply}
            onClose={() => setPresetToApply(null)}
          />
        ) : null}
      </AlertDialog.Root>
    </>
  );
}

function ApplyPresetDialog({
  preset,
  onClose,
}: {
  preset: string;
  onClose: () => void;
}) {
  const resetChannels = useApplyChannelPreset();

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop />
      <AlertDialog.Content size="sm">
        <AlertDialog.Header>
          <AlertDialog.Media>
            <RadioIcon />
          </AlertDialog.Media>
          <AlertDialog.Title>
            <Trans message="Apply preset" />
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans message="Are you sure you want to apply this channel preset? This will delete all current channels and leave only channels from the selected preset." />
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={resetChannels.isPending}>
            <Trans message="Cancel" />
          </AlertDialog.Cancel>
          <AlertDialog.Action
            color="danger"
            disabled={resetChannels.isPending}
            onClick={() => {
              resetChannels.mutate({preset}, {onSuccess: () => onClose()});
            }}
          >
            <Trans message="Apply" />
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}

function ChannelsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <RadioIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching channels" />
          ) : (
            <Trans message="No channels have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query or different filters." />
          ) : (
            <Trans message="Get started by adding your first channel." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <AddNewChannelButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

function MobileChannelsList({channels}: {channels: Channel[]}) {
  return (
    <Item.Group>
      {channels.map(channel => (
        <Item.Root key={channel.id} variant="outline">
          <Item.Content>
            <Item.Title className="flex items-center gap-2">
              {channel.name}
              {channel.internal ? (
                <Badge variant="secondary">
                  <Trans message="Internal" />
                </Badge>
              ) : null}
            </Item.Title>
            <Item.Description>
              {channel.config.adminDescription ? (
                <>
                  {channel.config.adminDescription}
                  {' • '}
                </>
              ) : null}
              {channel.updated_at ? (
                <FormattedDate date={channel.updated_at} />
              ) : null}
            </Item.Description>
          </Item.Content>
          <Item.Actions className="shrink-0 md:ml-0">
            <ChannelActionsButton channel={channel} />
          </Item.Actions>
        </Item.Root>
      ))}
    </Item.Group>
  );
}
