import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {Track} from '@app/web-player/tracks/track';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {TableDataItem} from '@common/ui/tables/types/table-data-item';
import {
  ComponentPropsWithoutRef,
  createContext,
  JSXElementConstructor,
} from 'react';

export type TrackTableItem = (Track | TableDataItem) & {
  isPlaceholder?: boolean;
};

export interface TrackTableMeta {
  queueGroupId?: string | number;
  hideTrackImage?: boolean;
  playlist?: PartialPlaylist;
}

export interface TrackTableRowElementProps extends ComponentPropsWithoutRef<'div'> {
  item: TrackTableItem;
  selected?: boolean;
}

export interface TrackTableContextValue {
  data: TrackTableItem[];
  meta: TrackTableMeta;
  selectedRows: (string | number)[];
  selectRow: (item: TrackTableItem | null, merge?: boolean) => void;
  toggleRow: (item: TrackTableItem) => void;
  sortDescriptor?: Partial<SortDescriptor> | null;
  onSortChange?: (descriptor: Partial<SortDescriptor> | null) => void;
  enableSorting: boolean;
  isCollapsedMode: boolean;
  hideHeaderRow: boolean;
  onAction?: (item: TrackTableItem, index: number) => void;
  selectRowOnContextMenu: boolean;
  renderRowAs?: JSXElementConstructor<TrackTableRowElementProps>;
}

export const TrackTableContext = createContext<TrackTableContextValue>(null!);
