import {ChannelContentSearchFieldProps} from '@common/admin/channels/channel-editor/channel-content-search-field';
import {useAddToChannel} from '@common/admin/channels/requests/use-add-to-channel';
import {useRemoveFromChannel} from '@common/admin/channels/requests/use-remove-from-channel';
import {useReorderChannelContent} from '@common/admin/channels/requests/use-reorder-channel-content';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {useUpdateChannelContent} from '@common/admin/channels/requests/use-update-channel-content';
import {Channel, ChannelContentItem} from '@common/channels/channel';
import {useChannelContent} from '@common/channels/requests/use-channel-content';
import {queryClient} from '@common/http/query-client';
import {Button} from '@shadcn/button/button';
import {Empty} from '@shadcn/empty/empty';
import {BackendPagination} from '@shadcn/table/utils/table-pagination';
import {UseQueryResult} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {DragPreview} from '@ui/interactions/dnd/drag-preview';
import {
  DropPosition,
  useSortable,
} from '@ui/interactions/dnd/sortable/use-sortable';
import {DragPreviewRenderer} from '@ui/interactions/dnd/use-draggable';
import {NormalizedModel} from '@ui/types/normalized-model';
import {moveItemInNewArray} from '@ui/utils/array/move-item-in-new-array';
import {cn} from '@ui/utils/cn';
import {useIsTouchDevice} from '@ui/utils/hooks/is-touch-device';
import {
  CircleAlertIcon,
  GripHorizontalIcon,
  ImageIcon,
  ListMusicIcon,
  RefreshCcwIcon,
  XIcon,
} from 'lucide-react';
import React, {
  cloneElement,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {Link, useParams, useSearchParams} from 'react-router';

interface Props {
  searchField: ReactElement<ChannelContentSearchFieldProps>;
  title?: ReactNode;
  noResultsMessage?: ReactNode;
}
export function ChannelContentEditor({
  searchField,
  title,
  noResultsMessage,
}: Props) {
  const {watch, getValues} = useFormContext<UpdateChannelPayload>();
  const channel = getValues() as Channel<ChannelContentItem<NormalizedModel>>;
  const contentType = watch('config.contentType');
  const contentOrder = watch('config.contentOrder');
  const addToChannel = useAddToChannel();
  const {query, queryKey} = useChannelContent<
    ChannelContentItem<NormalizedModel>
  >(channel, 'editChannelPage');
  const contentQueryKey = queryKey as unknown as unknown[];
  const pagination = query.data!.channel.content;
  const items = pagination?.data || [];

  const showActions = contentType === 'manual';
  const showDrag =
    contentType === 'manual' && contentOrder === 'channelables.order:asc';

  return (
    <div className="mt-10">
      <div className="mb-4">
        <h2 className="mb-2.5 text-2xl">
          {title || <Trans message="Channel content" />}
        </h2>
        <ContentNotEditableWarning />
        <UpdateContentButton />
        {contentType === 'manual'
          ? cloneElement<ChannelContentSearchFieldProps>(searchField, {
              onResultSelected: result => {
                addToChannel.mutate({
                  channelId: channel.id,
                  item: result,
                });
              },
            })
          : null}
      </div>
      <Pagination query={query} className="mb-6 justify-start" />
      {items.length ? (
        <div className="flex flex-col text-sm">
          {items.map(item => (
            <ContentListItem
              key={item.id}
              item={item}
              items={items}
              queryKey={contentQueryKey}
              showDrag={showDrag}
              showActions={showActions}
            />
          ))}
        </div>
      ) : null}
      {!items.length
        ? noResultsMessage || (
            <Empty.Root className="mt-6">
              <Empty.Header>
                <Empty.Media variant="icon">
                  <ListMusicIcon />
                </Empty.Media>
                <Empty.Title>
                  <Trans message="Channel is empty" />
                </Empty.Title>
                <Empty.Description>
                  {contentType === 'manual' ? (
                    <Trans message="No content is attached to this channel yet." />
                  ) : (
                    <Trans message="No content to show for this channel yet." />
                  )}
                </Empty.Description>
              </Empty.Header>
            </Empty.Root>
          )
        : null}
      <Pagination query={query} className="mt-6 justify-start" />
    </div>
  );
}

interface PaginationProps {
  query: UseQueryResult<{
    channel: Channel<ChannelContentItem<NormalizedModel>>;
  }>;
  className?: string;
}
function Pagination({query, className}: PaginationProps) {
  const [, setSearchParams] = useSearchParams();
  if (!query.data?.channel.content) return null;
  const pagination = query.data.channel.content;

  return (
    <BackendPagination
      response={{pagination}}
      disabled={query.isLoading}
      onPageChange={page => {
        setSearchParams(prev => {
          prev.set('page', page.toString());
          return prev;
        });
      }}
      onPageSizeChange={perPage => {
        setSearchParams(prev => {
          prev.set('perPage', perPage.toString());
          prev.delete('page');
          return prev;
        });
      }}
      className={className}
    />
  );
}

interface ContentListItemProps {
  item: NormalizedModel;
  items: NormalizedModel[];
  queryKey: unknown[];
  showDrag: boolean;
  showActions: boolean;
}
function ContentListItem({
  item,
  items,
  queryKey,
  showDrag,
  showActions,
}: ContentListItemProps) {
  const isTouchDevice = useIsTouchDevice();
  const {getValues} = useFormContext<UpdateChannelPayload>();
  const domRef = useRef<HTMLDivElement>(null);
  const reorderContent = useReorderChannelContent();
  const previewRef = useRef<DragPreviewRenderer>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);

  const {sortableProps} = useSortable({
    ref: domRef,
    disabled: isTouchDevice || !showDrag,
    item,
    items,
    type: 'channelContentItem',
    preview: previewRef,
    strategy: 'line',
    onDropPositionChange: position => {
      setDropPosition(position);
    },
    onSortEnd: (oldIndex, newIndex) => {
      const newData = queryClient.setQueryData<{
        channel: Channel<ChannelContentItem<NormalizedModel>>;
      }>(queryKey, data => {
        if (data?.channel.content) {
          data = {
            ...data,
            channel: {
              ...data.channel,
              content: {
                ...data.channel.content,
                data: moveItemInNewArray(
                  data.channel.content.data,
                  oldIndex,
                  newIndex,
                ),
              },
            },
          };
        }
        return data;
      });

      if (newData?.channel.content) {
        reorderContent.mutate({
          channelId: getValues('id'),
          modelType: item.model_type!,
          ids: newData.channel.content?.data.map(
            contentItem => (contentItem as NormalizedModel).id,
          ),
        });
      }
    },
  });

  return (
    <>
      <div
        ref={domRef}
        className={cn(
          'flex items-center gap-3 border-t border-b border-t-transparent py-3 last:border-b-transparent',
          dropPosition === 'before' && 'sort-preview-before',
          dropPosition === 'after' && 'sort-preview-after',
        )}
        {...(showDrag ? sortableProps : {})}
      >
        {showDrag ? (
          <GripHorizontalIcon className="text-muted-foreground size-4 shrink-0 cursor-pointer" />
        ) : null}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="size-8 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="bg-muted rounded-card-xs flex size-8 shrink-0 items-center justify-center">
              <ImageIcon className="text-muted-foreground size-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate font-medium">
              {item.model_type === 'channel' ? (
                <Link
                  className="hover:underline"
                  to={`/admin/channels/${item.id}/edit`}
                  target="_blank"
                >
                  {item.name}
                </Link>
              ) : (
                item.name
              )}
            </div>
            {item.description ? (
              <div className="text-muted-foreground truncate text-xs">
                {item.description}
              </div>
            ) : null}
          </div>
        </div>
        <span className="w-25 shrink-0 capitalize">{item.model_type}</span>
        {showActions ? <RemoveItemButton item={item} /> : null}
      </div>
      {showDrag ? <RowDragPreview item={item} ref={previewRef} /> : null}
    </>
  );
}

interface RowDragPreviewProps {
  item: NormalizedModel;
}
const RowDragPreview = React.forwardRef<
  DragPreviewRenderer,
  RowDragPreviewProps
>(({item}, ref) => {
  return (
    <DragPreview ref={ref}>
      {() => (
        <div className="bg-secondary rounded-sm p-2 text-base shadow-sm">
          {item.name}
        </div>
      )}
    </DragPreview>
  );
});

interface RemoveItemButtonProps {
  item: NormalizedModel;
}
function RemoveItemButton({item}: RemoveItemButtonProps) {
  const removeFromChannel = useRemoveFromChannel();
  const {getValues} = useFormContext<UpdateChannelPayload>();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground"
      disabled={removeFromChannel.isPending}
      type="button"
      onClick={() => {
        removeFromChannel.mutate({
          channelId: getValues('id'),
          item: item,
        });
      }}
    >
      <XIcon />
    </Button>
  );
}

function ContentNotEditableWarning() {
  const {watch} = useFormContext<UpdateChannelPayload>();
  const contentType = watch('config.contentType');

  if (contentType === 'manual') {
    return null;
  }

  return (
    <div className="mt-1 mb-5 flex items-center gap-2">
      <CircleAlertIcon className="size-4 shrink-0" />
      <div className="text-muted-foreground text-sm">
        {contentType === 'listAll' ? (
          <Trans message="This channel is listing all available content of specified type, and can't be curated manually." />
        ) : null}
        {contentType === 'autoUpdate' ? (
          <Trans message="This channel content is set to update automatically and can't be curated manually." />
        ) : null}
      </div>
    </div>
  );
}

function UpdateContentButton() {
  const {slugOrId} = useParams();
  const updateContent = useUpdateChannelContent(slugOrId!);
  const {setValue, watch, getValues} = useFormContext<UpdateChannelPayload>();

  if (watch('config.contentType') !== 'autoUpdate') {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="outline"
      color="primary"
      type="button"
      className="mb-4"
      onClick={() => {
        updateContent.mutate(
          {
            channelConfig: (getValues as any)('config'),
          },
          {
            onSuccess: response => {
              if (response.channel.content) {
                (setValue as any)('content', response.channel.content);
              }
            },
          },
        );
      }}
      disabled={
        updateContent.isPending ||
        !watch('config.autoUpdateMethod') ||
        !watch('id')
      }
    >
      <RefreshCcwIcon />
      <Trans message="Update content now" />
    </Button>
  );
}
