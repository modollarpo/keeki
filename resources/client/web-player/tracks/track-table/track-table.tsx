import {AlbumLink} from '@app/web-player/albums/album-link';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {TableTrackContextDialog} from '@app/web-player/tracks/context-dialog/table-track-context-dialog';
import {LibraryPageTrack, Track} from '@app/web-player/tracks/track';
import {TogglePlaybackColumn} from '@app/web-player/tracks/track-table/toggle-playback-column';
import {
  TrackNameColumn,
  TrackNameColumnPlaceholder,
} from '@app/web-player/tracks/track-table/track-name-column';
import {TrackOptionsColumn} from '@app/web-player/tracks/track-table/track-options-column';
import {
  TrackTableContext,
  TrackTableContextValue,
  TrackTableItem,
  TrackTableMeta,
  TrackTableRowElementProps,
} from '@app/web-player/tracks/track-table/track-table-context';
import {tracksToMediaItems} from '@app/web-player/tracks/utils/track-to-media-item';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {TableDataItem} from '@common/ui/tables/types/table-data-item';
import {useInteractOutside} from '@react-aria/interactions';
import {useControlledState} from '@react-stately/utils';
import {ContextMenu} from '@shadcn/context-menu/context-menu';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {FormattedRelativeTime} from '@ui/i18n/formatted-relative-time';
import {Trans} from '@ui/i18n/trans';
import {usePointerEvents} from '@ui/interactions/use-pointer-events';
import {Skeleton} from '@ui/skeleton/skeleton';
import {cn} from '@ui/utils/cn';
import {ignoreEventsFromPortal} from '@ui/utils/dom/ignore-events-from-portal';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {isCtrlKeyPressed} from '@ui/utils/keybinds/is-ctrl-key-pressed';
import {isCtrlOrShiftPressed} from '@ui/utils/keybinds/is-ctrl-or-shift-pressed';
import {ArrowDownIcon, ClockIcon, TrendingUpIcon} from 'lucide-react';
import {
  cloneElement,
  createContext,
  CSSProperties,
  JSXElementConstructor,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

type VisibleInMode = 'compact' | 'regular' | 'all';

interface TrackColumn {
  key: string;
  sortingKey?: string;
  allowsSorting?: boolean;
  hideHeader?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
  width?: string;
  truncate?: boolean;
  visibleInMode?: VisibleInMode;
  header: () => ReactNode;
  body: (
    track: Track | LibraryPageTrack,
    row: {index: number; isHovered: boolean; isPlaceholder?: boolean},
  ) => ReactNode;
}

const columnConfig: TrackColumn[] = [
  {
    key: 'index',
    align: 'center',
    width: 'w-12 shrink-0',
    visibleInMode: 'regular',
    header: () => <span>#</span>,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="size-5" variant="rect" />;
      }
      return (
        <TogglePlaybackColumn
          track={track}
          rowIndex={row.index}
          isHovered={row.isHovered}
        />
      );
    },
  },
  {
    key: 'name',
    allowsSorting: true,
    width: 'min-w-0 flex-1',
    visibleInMode: 'all',
    header: () => <Trans message="Title" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <TrackNameColumnPlaceholder />;
      }
      return <TrackNameColumn track={track} />;
    },
  },
  {
    key: 'album_id',
    allowsSorting: true,
    width: 'w-[28%] shrink-0',
    header: () => <Trans message="Album" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="w-36 leading-4" />;
      }
      return track.album ? <AlbumLink album={track.album} /> : null;
    },
  },
  {
    key: 'added_at',
    sortingKey: 'likes.created_at',
    allowsSorting: true,
    width: 'w-28 shrink-0',
    header: () => <Trans message="Date added" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="w-36 leading-4" />;
      }
      return (
        <FormattedRelativeTime date={(track as LibraryPageTrack).added_at} />
      );
    },
  },
  {
    key: 'options',
    align: 'end',
    width: 'w-14 shrink-0 md:w-28',
    truncate: false,
    hideHeader: true,
    visibleInMode: 'all',
    header: () => <Trans message="Options" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return (
          <div className="flex justify-end">
            <Skeleton className="size-5 shrink-0" variant="rect" />
          </div>
        );
      }
      return <TrackOptionsColumn track={track} isHovered={row.isHovered} />;
    },
  },
  {
    key: 'duration',
    allowsSorting: true,
    className: 'text-muted-foreground',
    width: 'w-20 shrink-0',
    truncate: false,
    align: 'end',
    header: () => <ClockIcon className="size-4" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="w-10 leading-4" />;
      }
      return track.duration ? <FormattedDuration ms={track.duration} /> : null;
    },
  },
  {
    key: 'popularity',
    allowsSorting: true,
    className: 'text-muted-foreground',
    width: 'w-16 shrink-0',
    header: () => <TrendingUpIcon className="size-4" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="w-13.5 leading-4" />;
      }
      return (
        <div className="bg-secondary relative h-1.5 w-13.5 rounded-sm">
          <div
            style={{width: `${track.popularity || 50}%`}}
            className="absolute top-0 left-0 h-1.5 w-0 rounded-sm bg-black/30 dark:bg-white/30"
          />
        </div>
      );
    },
  },
];

const TrackTableColumnsContext = createContext<TrackColumn[]>([]);

const interactableElements = ['button', 'a', 'input', 'select', 'textarea'];

export interface TrackTableProps {
  tracks: Track[] | TableDataItem[];
  hideAlbum?: boolean;
  hideTrackImage?: boolean;
  hidePopularity?: boolean;
  hideAddedAtColumn?: boolean;
  hideHeaderRow?: boolean;
  queueGroupId?: string | number;
  playlist?: PartialPlaylist;
  renderRowAs?: JSXElementConstructor<TrackTableRowElementProps>;
  sortDescriptor?: Partial<SortDescriptor> | null;
  onSortChange?: (descriptor: Partial<SortDescriptor> | null) => void;
  enableSorting?: boolean;
  tableBody?: ReactElement<{
    renderRowAs?: JSXElementConstructor<TrackTableRowElementProps>;
  }>;
  className?: string;
}

export function TrackTable({
  tracks,
  hideAlbum = false,
  hideHeaderRow: hideHeaderRowProp = false,
  hideTrackImage = false,
  hidePopularity = true,
  hideAddedAtColumn = true,
  queueGroupId,
  renderRowAs,
  playlist,
  sortDescriptor: propsSortDescriptor,
  onSortChange: propsOnSortChange,
  enableSorting = true,
  tableBody,
  className,
}: TrackTableProps) {
  const player = usePlayerActions();
  const isMobile = useIsMobileMediaQuery();
  const isCollapsedMode = !!isMobile;
  const hideHeaderRow = hideHeaderRowProp || isCollapsedMode;
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedRows, onSelectionChange] = useControlledState<
    (string | number)[]
  >(undefined, [], undefined);

  const [sortDescriptor, onSortChange] = useControlledState(
    propsSortDescriptor,
    undefined,
    propsOnSortChange,
  );

  const filteredColumns = useMemo(() => {
    return columnConfig.filter(col => {
      if (col.key === 'album_id' && hideAlbum) {
        return false;
      }
      if (col.key === 'popularity' && hidePopularity) {
        return false;
      }
      if (col.key === 'added_at' && hideAddedAtColumn) {
        return false;
      }
      const visibleInMode = col.visibleInMode || 'regular';
      if (visibleInMode === 'all') {
        return true;
      }
      if (visibleInMode === 'compact' && isCollapsedMode) {
        return true;
      }
      if (visibleInMode === 'regular' && !isCollapsedMode) {
        return true;
      }
      return false;
    });
  }, [hideAlbum, hidePopularity, hideAddedAtColumn, isCollapsedMode]);

  const meta: TrackTableMeta = useMemo(() => {
    return {queueGroupId, hideTrackImage, playlist};
  }, [queueGroupId, hideTrackImage, playlist]);

  const toggleRow = useCallback(
    (item: TrackTableItem) => {
      const newValues = [...selectedRows];
      if (!newValues.includes(item.id)) {
        newValues.push(item.id);
      } else {
        const index = newValues.indexOf(item.id);
        newValues.splice(index, 1);
      }
      onSelectionChange(newValues);
    },
    [selectedRows, onSelectionChange],
  );

  const selectRow = useCallback(
    (item: TrackTableItem | null, merge?: boolean) => {
      let newValues: (string | number)[] = [];
      if (item) {
        newValues = merge
          ? [...selectedRows.filter(id => id !== item.id), item.id]
          : [item.id];
      }
      onSelectionChange(newValues);
    },
    [selectedRows, onSelectionChange],
  );

  const onAction = useCallback(
    async (track: TrackTableItem, index: number) => {
      if (track.isPlaceholder) return;
      const newQueue = await tracksToMediaItems(
        tracks as Track[],
        queueGroupId as string,
      );
      player.overrideQueueAndPlay(newQueue, index);
    },
    [tracks, queueGroupId, player],
  );

  useInteractOutside({
    ref: containerRef as RefObject<Element>,
    onInteractOutside: e => {
      if (
        selectedRows.length &&
        !(e.target as HTMLElement).closest('[role="dialog"]') &&
        !(e.target as HTMLElement).closest('[role="menu"]') &&
        !(e.target as HTMLElement).closest('[data-slot="context-menu-content"]')
      ) {
        onSelectionChange([]);
      }
    },
  });

  const contextValue: TrackTableContextValue = useMemo(
    () => ({
      data: tracks as TrackTableItem[],
      meta,
      selectedRows,
      selectRow,
      toggleRow,
      sortDescriptor,
      onSortChange,
      enableSorting,
      isCollapsedMode,
      hideHeaderRow,
      onAction,
      selectRowOnContextMenu: true,
      renderRowAs: renderRowAs || TrackTableRowWithContextMenu,
    }),
    [
      tracks,
      meta,
      selectedRows,
      selectRow,
      toggleRow,
      sortDescriptor,
      onSortChange,
      enableSorting,
      isCollapsedMode,
      hideHeaderRow,
      onAction,
      renderRowAs,
    ],
  );

  const body = tableBody ? (
    cloneElement(tableBody, {
      renderRowAs: contextValue.renderRowAs,
    })
  ) : (
    <BasicTrackTableBody />
  );

  return (
    <TrackTableContext.Provider value={contextValue}>
      <TrackTableColumnsContext.Provider value={filteredColumns}>
        <div
          ref={containerRef}
          tabIndex={0}
          className={cn('isolate outline-hidden select-none', className)}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              if (selectedRows.length) {
                onSelectionChange([]);
              }
            } else if (isCtrlKeyPressed(e) && e.key === 'a') {
              e.preventDefault();
              e.stopPropagation();
              onSelectionChange(tracks.map(item => item.id));
            }
          }}
        >
          <div role="table" className="w-full text-sm">
            {!hideHeaderRow && (
              <div role="rowgroup">
                <div
                  role="row"
                  className="flex items-center gap-3 border-b px-3 hover:bg-transparent"
                >
                  {filteredColumns.map((column, index) => (
                    <TrackTableHeaderCell
                      key={column.key}
                      column={column}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
            <div role="rowgroup">{body}</div>
          </div>
        </div>
      </TrackTableColumnsContext.Provider>
    </TrackTableContext.Provider>
  );
}

function BasicTrackTableBody() {
  const {data, renderRowAs} = useContext(TrackTableContext);
  return (
    <>
      {data.map((item, index) => (
        <TrackTableRow
          key={item.id}
          item={item}
          index={index}
          renderAs={renderRowAs}
        />
      ))}
    </>
  );
}

interface TrackTableHeaderCellProps {
  column: TrackColumn;
  index: number;
}

function TrackTableHeaderCell({column, index}: TrackTableHeaderCellProps) {
  const {sortDescriptor, onSortChange, enableSorting} =
    useContext(TrackTableContext);
  const [isHovered, setIsHovered] = useState(false);

  const sortingKey = column.sortingKey || column.key;
  const allowSorting = !!column.allowsSorting && enableSorting;
  const {orderBy, orderDir} = sortDescriptor || {};
  const sortActive = allowSorting && orderBy === sortingKey;

  const toggleSorting = () => {
    if (!allowSorting) return;
    if (sortActive && orderDir === 'desc') {
      onSortChange?.({orderDir: 'asc', orderBy: sortingKey});
    } else if (sortActive && orderDir === 'asc') {
      onSortChange?.(null);
    } else {
      onSortChange?.({orderDir: 'desc', orderBy: sortingKey});
    }
  };

  const sortVisible = sortActive || isHovered;

  return (
    <div
      role="columnheader"
      tabIndex={-1}
      aria-colindex={index + 1}
      aria-sort={
        sortActive
          ? orderDir === 'asc'
            ? 'ascending'
            : 'descending'
          : allowSorting
            ? 'none'
            : undefined
      }
      className={cn(
        'text-muted-foreground flex h-11.5 items-center text-xs font-medium',
        column.width,
        column.align === 'center' && 'justify-center text-center',
        column.align === 'end' && 'justify-end text-end',
        allowSorting && 'cursor-pointer',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleSorting}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleSorting();
        }
      }}
    >
      {column.hideHeader ? (
        <span className="opacity-0">{column.header()}</span>
      ) : (
        column.header()
      )}
      {allowSorting && (
        <ArrowDownIcon
          className={cn(
            'ml-1.5 inline-block size-3.5 transition-opacity',
            !sortVisible && 'opacity-0',
            sortActive && orderDir === 'asc' && 'rotate-180',
          )}
        />
      )}
    </div>
  );
}

interface TrackTableRowProps {
  item: TrackTableItem;
  index: number;
  renderAs?: JSXElementConstructor<TrackTableRowElementProps>;
  className?: string;
  style?: CSSProperties;
}

export function TrackTableRow({
  item,
  index,
  renderAs,
  className,
  style,
}: TrackTableRowProps) {
  const {
    selectedRows,
    toggleRow,
    selectRow,
    onAction,
    selectRowOnContextMenu,
    hideHeaderRow,
  } = useContext(TrackTableContext);
  const columns = useContext(TrackTableColumnsContext);

  const isTouchDevice = useRef(false);
  const isMobile = useIsMobileMediaQuery();
  const isSelected = selectedRows.includes(item.id);
  const [isHovered, setIsHovered] = useState(false);

  const clickedOnInteractable = (e: React.MouseEvent | PointerEvent) => {
    return (e.target as HTMLElement).closest(interactableElements.join(','));
  };

  const anyRowsSelected = !!selectedRows.length;

  const handleRowTap = (e: PointerEvent) => {
    if (clickedOnInteractable(e)) return;
    if (isTouchDevice.current) {
      if (anyRowsSelected) {
        toggleRow(item);
      } else {
        onAction?.(item, index);
      }
    } else {
      selectRow(item, isCtrlOrShiftPressed(e));
    }
  };

  const {domProps} = usePointerEvents({
    onPointerDown: e => {
      isTouchDevice.current = e.pointerType === 'touch';
    },
    onPress: handleRowTap,
    onLongPress: () => {
      if (isTouchDevice.current) {
        toggleRow(item);
      }
    },
  });

  const doubleClickHandler: MouseEventHandler = e => {
    if (onAction && !isTouchDevice.current && !clickedOnInteractable(e)) {
      e.preventDefault();
      e.stopPropagation();
      onAction(item, index);
    }
  };

  const keyboardHandler: KeyboardEventHandler = e => {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      selectRow(item);
    } else if (e.key === 'Enter' && !selectedRows.length && onAction) {
      e.preventDefault();
      e.stopPropagation();
      onAction(item, index);
    }
  };

  const contextMenuHandler: MouseEventHandler = e => {
    if (selectRowOnContextMenu && !selectedRows.includes(item.id)) {
      selectRow(item);
    }
    if (isTouchDevice.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const cells = columns.map((column, cellIndex) => {
    const body = column.body(item as Track, {
      index,
      isHovered,
      isPlaceholder: item.isPlaceholder,
    });
    const truncate = column.truncate !== false && !item.isPlaceholder;

    return (
      <div
        role="cell"
        key={`${item.id}-${column.key}`}
        tabIndex={-1}
        aria-colindex={cellIndex + 1}
        className={cn(
          'flex h-14 items-center py-0 whitespace-nowrap',
          truncate ? 'overflow-hidden' : 'overflow-visible',
          column.width,
          column.className,
          column.align === 'center' && 'justify-center text-center',
          column.align === 'end' && 'justify-end text-end',
        )}
      >
        {truncate ? (
          <div className="min-w-0 overflow-hidden text-ellipsis">{body}</div>
        ) : (
          body
        )}
      </div>
    );
  });

  const rowProps: TrackTableRowElementProps = {
    item,
    role: 'row',
    'aria-rowindex': index + 1 + (hideHeaderRow ? 0 : 1),
    'aria-selected': isSelected,
    tabIndex: -1,
    selected: isSelected,
    className: cn(
      'flex cursor-pointer items-center border-b border-transparent transition-colors gap-3 rounded-md',
      !isMobile && 'px-3',
      isSelected && 'bg-accent hover:bg-accent',
      !isSelected && 'hover:bg-accent focus-visible:bg-accent',
      className,
    ),
    style,
    onDoubleClick: ignoreEventsFromPortal(doubleClickHandler),
    onKeyDown: ignoreEventsFromPortal(keyboardHandler),
    onContextMenu: ignoreEventsFromPortal(contextMenuHandler),
    onPointerEnter: ignoreEventsFromPortal(() => setIsHovered(true)),
    onPointerLeave: ignoreEventsFromPortal(() => setIsHovered(false)),
    ...domProps,
    children: cells,
  };

  if (renderAs) {
    const RowElement = renderAs;
    return <RowElement {...rowProps} />;
  }

  const {item: _item, selected: _selected, ...divProps} = rowProps;
  return <div {...divProps} />;
}

function TrackTableRowWithContextMenu({
  item,
  children,
  selected: _selected,
  ...domProps
}: TrackTableRowElementProps) {
  if (item.isPlaceholder) {
    return <div {...domProps}>{children}</div>;
  }
  return (
    <ContextMenu>
      <ContextMenu.Trigger render={<div {...domProps} />}>
        {children}
      </ContextMenu.Trigger>
      <TableTrackContextDialog type="contextMenu" />
    </ContextMenu>
  );
}
