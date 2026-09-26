import {UpdateLyricDialog} from '@app/admin/lyrics-datatable-page/update-lyric-dialog';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {Lyric} from '@app/web-player/tracks/lyrics/lyric';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {checkboxColumnDef} from '@shadcn/table/utils/checkbox-column-def';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {PencilIcon} from 'lucide-react';

export const lyricsDatatableColumns: ColumnDef<Lyric>[] = [
  checkboxColumnDef<Lyric>(),
  {
    id: 'track_id',
    accessorKey: 'track_id',
    enableSorting: true,
    size: 280,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Track" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const lyric = row.original;
      if (!lyric.track) return null;
      return (
        <div className="flex min-w-0 items-center gap-2">
          <TrackImage
            track={lyric.track}
            className="shrink-0"
            size="size-8.5 rounded-md"
          />
          <div className="max-w-84 min-w-0 truncate">
            <TrackLink
              track={lyric.track}
              target="_blank"
              className="truncate"
              onClick={e => e.stopPropagation()}
            />
            <ArtistLinks
              className="text-muted-foreground text-sm"
              artists={lyric.track.artists}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: 'album',
    enableSorting: false,
    header: () => <Trans message="Album" />,
    cell: ({row}) => {
      const album = row.original.track?.album;
      if (!album) return null;
      return (
        <AlbumLink
          album={album}
          className="max-w-84 truncate"
          onClick={e => e.stopPropagation()}
        />
      );
    },
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Last updated" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.updated_at ? (
        <time>
          <FormattedDate date={row.original.updated_at} />
        </time>
      ) : null,
  },
  {
    id: 'actions',
    size: 1,
    header: () => (
      <span className="hidden">
        <Trans message="Actions" />
      </span>
    ),
    cell: ({row}) => <LyricActionsButton lyric={row.original} />,
  },
];

export function LyricActionsButton({lyric}: {lyric: Lyric}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <UpdateLyricDialog lyric={lyric}>
        <Dialog.Trigger
          render={
            <Button
              variant="ghost"
              size="icon"
              onClick={e => e.stopPropagation()}
            />
          }
        >
          <PencilIcon />
          <span className="sr-only">
            <Trans message="Edit" />
          </span>
        </Dialog.Trigger>
      </UpdateLyricDialog>
    </div>
  );
}
