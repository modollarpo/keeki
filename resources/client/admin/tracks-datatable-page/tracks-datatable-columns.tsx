import {CreateLyricDialog} from '@app/admin/lyrics-datatable-page/create-lyric-dialog';
import {UpdateLyricDialog} from '@app/admin/lyrics-datatable-page/update-lyric-dialog';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {checkboxColumnDef} from '@shadcn/table/utils/checkbox-column-def';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {EditIcon} from '@ui/icons/material/Edit';
import {BarChartIcon, CaptionsIcon, EllipsisIcon} from 'lucide-react';
import {Link} from 'react-router';

export const tracksDatatableColumns: ColumnDef<Track>[] = [
  checkboxColumnDef<Track>(),
  {
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 280,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Track" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const track = row.original;
      return (
        <div className="flex min-w-0 items-center gap-2">
          <TrackImage
            track={track}
            className="shrink-0"
            size="size-8 rounded-md"
          />
          <TrackLink
            track={track}
            target="_blank"
            className="truncate"
            onClick={e => e.stopPropagation()}
          />
        </div>
      );
    },
  },
  {
    id: 'artist',
    enableSorting: false,
    size: 200,
    header: () => <Trans message="Artist" />,
    cell: ({row}) => {
      const artist = row.original.artists?.[0];
      if (!artist) return null;
      return (
        <div className="flex min-w-0 items-center gap-2">
          <SmallArtistImage
            artist={artist}
            className="shrink-0"
            size="size-8 rounded-full"
          />
          <ArtistLink
            artist={artist}
            className="truncate"
            onClick={e => e.stopPropagation()}
          />
        </div>
      );
    },
  },
  {
    id: 'duration',
    accessorKey: 'duration',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Duration" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.duration ? (
        <FormattedDuration ms={row.original.duration} />
      ) : null,
  },
  {
    id: 'plays',
    accessorKey: 'plays',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Plays" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.plays ? (
        <FormattedNumber value={row.original.plays} />
      ) : null,
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
    cell: ({row}) => {
      const date = row.original.updated_at ?? row.original.created_at;
      return date ? (
        <time>
          <FormattedDate date={date} />
        </time>
      ) : null;
    },
  },
  {
    id: 'actions',
    size: 1,
    header: () => (
      <span className="hidden">
        <Trans message="Actions" />
      </span>
    ),
    cell: ({row}) => <TrackActionsButton track={row.original} />,
  },
];

export function TrackActionsButton({track}: {track: Track}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <Dropdown.Root>
        <Dropdown.Trigger render={<Button variant="ghost" size="icon-sm" />}>
          <EllipsisIcon />
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.LinkItem render={<Link to={`${track.id}/insights`} />}>
            <BarChartIcon />
            <Trans message="Insights" />
          </Dropdown.LinkItem>
          <LyricsActionItem track={track} />
          <Dropdown.LinkItem render={<Link to={`${track.id}/edit`} />}>
            <EditIcon />
            <Trans message="Edit" />
          </Dropdown.LinkItem>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
}

function LyricsActionItem({track}: {track: Track}) {
  const trigger = (
    <Dialog.Trigger render={<Dropdown.Item />}>
      <CaptionsIcon />
      <Trans message="Lyrics" />
    </Dialog.Trigger>
  );

  if (track.lyric) {
    return <UpdateLyricDialog lyric={track.lyric}>{trigger}</UpdateLyricDialog>;
  }

  return <CreateLyricDialog trackId={track.id}>{trigger}</CreateLyricDialog>;
}
