import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {PlaylistTrackContextDialog} from '@app/web-player/playlists/playlist-page/playlist-track-context-dialog';
import {useReorderPlaylistTracks} from '@app/web-player/playlists/requests/use-reorder-playlist-tracks';
import {Track} from '@app/web-player/tracks/track';
import {
  TrackTableContext,
  TrackTableRowElementProps,
} from '@app/web-player/tracks/track-table/track-table-context';
import {mergeProps} from '@react-aria/utils';
import {ContextMenu} from '@shadcn/context-menu/context-menu';
import {Trans} from '@ui/i18n/trans';
import {DragPreview} from '@ui/interactions/dnd/drag-preview';
import {useSortable} from '@ui/interactions/dnd/sortable/use-sortable';
import {DragPreviewRenderer} from '@ui/interactions/dnd/use-draggable';
import {useIsTouchDevice} from '@ui/utils/hooks/is-touch-device';
import React, {Fragment, useContext, useRef} from 'react';

export function PlaylistTableRow({
  item,
  children,
  className,
  selected: _selected,
  ...domProps
}: TrackTableRowElementProps) {
  const isTouchDevice = useIsTouchDevice();
  const {
    data: tracks,
    selectRow,
    selectedRows,
    sortDescriptor,
    meta,
  } = useContext(TrackTableContext);
  const domRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<DragPreviewRenderer>(null);
  const reorderTracks = useReorderPlaylistTracks();
  const playlist = meta?.playlist as FullPlaylist;

  const {sortableProps} = useSortable({
    ref: domRef,
    disabled:
      (isTouchDevice ?? false) ||
      reorderTracks.isPending ||
      // disable drag and drop if table is sorted via header
      sortDescriptor?.orderBy !== 'position',
    item: item,
    items: tracks,
    type: 'playlistTrack',
    preview: previewRef,
    strategy: 'line',
    onDragEnd: () => {
      selectRow(null);
    },
    onSortStart: () => {
      // if dragging a row that is already selected, do nothing,
      // otherwise deselect all other rows and select this one
      if (!selectedRows.includes(item.id)) {
        selectRow(item);
      }
    },
    onSortEnd: (oldIndex, newIndex) => {
      reorderTracks.mutate({
        tracks: tracks as Track[],
        oldIndexes:
          selectedRows.length > 1
            ? selectedRows.map(id => tracks.findIndex(t => t.id === id))
            : oldIndex,
        newIndex,
      });
    },
  });

  return (
    <Fragment>
      <ContextMenu>
        <ContextMenu.Trigger
          render={
            <div
              className={className}
              ref={domRef}
              {...mergeProps(sortableProps, domProps)}
            />
          }
        >
          {children}
        </ContextMenu.Trigger>
        <PlaylistTrackContextDialog playlist={playlist} type="contextMenu" />
      </ContextMenu>
      {!item.isPlaceholder && (
        <RowDragPreview track={item as Track} ref={previewRef} />
      )}
    </Fragment>
  );
}

interface RowDragPreviewProps {
  track: Track;
}
const RowDragPreview = React.forwardRef<
  DragPreviewRenderer,
  RowDragPreviewProps
>(({track}, ref) => {
  const {selectedRows} = useContext(TrackTableContext);

  const content =
    selectedRows.length > 1 ? (
      <Trans message=":count tracks" values={{count: selectedRows.length}} />
    ) : (
      `${track.name} - ${track.artists?.[0]?.name}`
    );

  return (
    <DragPreview ref={ref}>
      {() => (
        <div
          className="bg-secondary rounded p-2 text-base shadow-sm"
          role="presentation"
        >
          {content}
        </div>
      )}
    </DragPreview>
  );
});
