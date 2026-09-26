import {UpdateTagDialog} from '@app/admin/tags-datatable-page/update-tag-dialog';
import {Tag} from '@app/web-player/tags/tag';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {checkboxColumnDef} from '@shadcn/table/utils/checkbox-column-def';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {PencilIcon} from 'lucide-react';
import {Link} from 'react-router';

export const tagsDatatableColumns: ColumnDef<Tag>[] = [
  checkboxColumnDef<Tag>(),
  {
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 280,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Tag" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const tag = row.original;
      return (
        <Link
          to={`/tag/${tag.name}`}
          className="block truncate outline-hidden hover:underline focus-visible:underline"
          onClick={e => e.stopPropagation()}
        >
          {tag.display_name || tag.name}
        </Link>
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
    id: 'tracks_count',
    accessorKey: 'tracks_count',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Tracks" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.tracks_count ? (
        <FormattedNumber value={row.original.tracks_count} />
      ) : null,
  },
  {
    id: 'albums_count',
    accessorKey: 'albums_count',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Albums" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.albums_count ? (
        <FormattedNumber value={row.original.albums_count} />
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
    cell: ({row}) => <TagActionsButton tag={row.original} />,
  },
];

export function TagActionsButton({tag}: {tag: Tag}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <UpdateTagDialog tag={tag}>
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
      </UpdateTagDialog>
    </div>
  );
}
