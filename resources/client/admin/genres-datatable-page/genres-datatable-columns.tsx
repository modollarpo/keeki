import {UpdateGenreDialog} from '@app/admin/genres-datatable-page/update-genre-dialog';
import {Genre} from '@app/web-player/genres/genre';
import {GenreLink} from '@app/web-player/genres/genre-link';
import {Avatar} from '@shadcn/avatar/avatar';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {checkboxColumnDef} from '@shadcn/table/utils/checkbox-column-def';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {PencilIcon} from 'lucide-react';

export type TableGenre = Genre & {
  artists_count?: number;
  updated_at?: string;
};

export const genresDatatableColumns: ColumnDef<TableGenre>[] = [
  checkboxColumnDef<TableGenre>(),
  {
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 280,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Genre" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const genre = row.original;
      return (
        <div className="flex min-w-0 items-center gap-2">
          <Avatar.Root size="default" className="size-8">
            <Avatar.Image src={genre.image ?? undefined} alt={genre.name} />
            <Avatar.ColorFallback>{genre.name}</Avatar.ColorFallback>
          </Avatar.Root>
          <GenreLink
            genre={genre}
            className="truncate"
            onClick={e => e.stopPropagation()}
          />
        </div>
      );
    },
  },
  {
    id: 'display_name',
    accessorKey: 'display_name',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Display name" />
      </SortableHeader>
    ),
    cell: ({row}) => row.original.display_name || row.original.name,
  },
  {
    id: 'artists_count',
    accessorKey: 'artists_count',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Number of artists" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.artists_count ? (
        <FormattedNumber value={row.original.artists_count} />
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
    cell: ({row}) => <GenreActionsButton genre={row.original} />,
  },
];

export function GenreActionsButton({genre}: {genre: TableGenre}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <UpdateGenreDialog genre={genre}>
        <Dialog.Trigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={e => e.stopPropagation()}
            />
          }
        >
          <PencilIcon />
          <span className="sr-only">
            <Trans message="Edit" />
          </span>
        </Dialog.Trigger>
      </UpdateGenreDialog>
    </div>
  );
}
