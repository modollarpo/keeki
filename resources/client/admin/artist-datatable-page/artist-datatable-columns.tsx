import {FullArtist} from '@app/web-player/artists/artist';
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
import {BarChartIcon, EllipsisIcon, EyeOffIcon} from 'lucide-react';
import {Link} from 'react-router';

export const artistDatatableColumns: ColumnDef<FullArtist>[] = [
  checkboxColumnDef<FullArtist>(),
  {
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 280,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Artist" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const artist = row.original;
      return (
        <div className="flex min-w-0 items-center gap-2">
          <SmallArtistImage
            artist={artist}
            className="shrink-0"
            size="size-8 rounded-full"
          />
          <ArtistLink
            artist={artist}
            target="_blank"
            className="truncate"
            onClick={e => e.stopPropagation()}
          />
          {artist.disabled ? (
            <EyeOffIcon className="text-muted-foreground size-4 shrink-0" />
          ) : null}
        </div>
      );
    },
  },
  {
    id: 'albums_count',
    accessorKey: 'albums_count',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Album count" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.albums_count ? (
        <FormattedNumber value={row.original.albums_count} />
      ) : null,
  },
  {
    id: 'plays',
    accessorKey: 'plays',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Total plays" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.plays ? (
        <FormattedNumber value={row.original.plays} />
      ) : null,
  },
  {
    id: 'views',
    accessorKey: 'views',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Page views" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.views ? (
        <FormattedNumber value={row.original.views} />
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
    cell: ({row}) => <ArtistActionsButton artist={row.original} />,
  },
];

export function ArtistActionsButton({artist}: {artist: FullArtist}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <Dropdown.Root>
        <Dropdown.Trigger render={<Button variant="ghost" size="icon-sm" />}>
          <EllipsisIcon />
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.LinkItem render={<Link to={`${artist.id}/insights`} />}>
            <BarChartIcon />
            <Trans message="Insights" />
          </Dropdown.LinkItem>
          <Dropdown.LinkItem render={<Link to={`${artist.id}/edit`} />}>
            <EditIcon />
            <Trans message="Edit" />
          </Dropdown.LinkItem>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
}
