import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {checkboxColumnDef} from '@shadcn/table/utils/checkbox-column-def';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {EditIcon} from '@ui/icons/material/Edit';
import {BarChartIcon, EllipsisIcon} from 'lucide-react';
import {Link} from 'react-router';

export const albumsDatatableColumns: ColumnDef<FullAlbum>[] = [
  checkboxColumnDef<FullAlbum>(),
  {
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 280,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Album" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const album = row.original;
      return (
        <div className="flex min-w-0 items-center gap-2">
          <AlbumImage
            album={album}
            className="shrink-0"
            size="size-8 rounded-md"
          />
          <AlbumLink
            album={album}
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
    id: 'release_date',
    accessorKey: 'release_date',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Release date" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.release_date ? (
        <time>
          <FormattedDate date={row.original.release_date} />
        </time>
      ) : null,
  },
  {
    id: 'track_count',
    accessorKey: 'tracks_count',
    enableSorting: false,
    header: () => <Trans message="Track count" />,
    cell: ({row}) =>
      row.original.tracks_count ? (
        <FormattedNumber value={row.original.tracks_count} />
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
    cell: ({row}) => <AlbumActionsButton album={row.original} />,
  },
];

export function AlbumActionsButton({album}: {album: FullAlbum}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <Dropdown.Root>
        <Dropdown.Trigger render={<Button variant="ghost" size="icon-sm" />}>
          <EllipsisIcon />
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.LinkItem render={<Link to={`${album.id}/insights`} />}>
            <BarChartIcon />
            <Trans message="Insights" />
          </Dropdown.LinkItem>
          <Dropdown.LinkItem render={<Link to={`${album.id}/edit`} />}>
            <EditIcon />
            <Trans message="Edit" />
          </Dropdown.LinkItem>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
}
