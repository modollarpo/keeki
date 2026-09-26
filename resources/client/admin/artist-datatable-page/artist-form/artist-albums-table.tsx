import {UpdateArtistPayload} from '@app/admin/artist-datatable-page/requests/use-update-artist';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {useDeleteAlbum} from '@app/web-player/albums/requests/use-delete-album';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Button, LinkButton} from '@shadcn/button/button';
import {Empty} from '@shadcn/empty/empty';
import {GenericTable} from '@shadcn/table/generic-table';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {TablePagination} from '@shadcn/table/utils/table-pagination';
import {TableSearchInput} from '@shadcn/table/utils/table-search-input';
import {useTable} from '@shadcn/table/utils/use-table';
import {useTableQueryState} from '@shadcn/table/utils/use-table-query-state';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {
  Disc3Icon,
  InfoIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import {useState} from 'react';
import {useFormContext} from 'react-hook-form';

const columns: ColumnDef<FullAlbum>[] = [
  {
    id: 'name',
    accessorFn: album => album.name,
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Name" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const album = row.original;
      return (
        <div className="flex items-center gap-3">
          <AlbumImage
            album={album}
            className="shrink-0"
            size="size-8 rounded-card-xs"
          />
          <AlbumLink album={album} target="_blank" className="max-w-100" />
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
        <FormattedDate date={row.original.release_date} />
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
    id: 'actions',
    size: 1,
    header: () => (
      <span className="sr-only">
        <Trans message="Actions" />
      </span>
    ),
    cell: ({row}) => <RowActions album={row.original} />,
  },
];

interface Props {
  albums?: FullAlbum[];
}
export function ArtistAlbumsTable({albums = []}: Props) {
  const {watch} = useFormContext<UpdateArtistPayload>();
  const artistId = watch('id');
  const {queryState, setQueryState, isFiltering} = useTableQueryState();

  const table = useTable({
    data: albums,
    columns,
    enableRowSelection: false,
    sort: queryState.sort,
    onSortChange: sort => setQueryState({sort}),
    isClientSide: true,
    globalFilter: queryState.query,
    pagination: {
      per_page: queryState.per_page,
      page: queryState.page,
    },
    onPaginationChange: pagination => setQueryState({...pagination}),
  });
  const isEmpty = table.getRowCount() === 0;

  return (
    <div>
      <div className="my-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">
            <Trans message="Albums" />
          </h2>
          {artistId ? (
            <LinkButton
              variant="outline"
              color="primary"
              size="sm"
              className="ml-auto"
              to={`../../../albums/new?artistId=${artistId}`}
              relative="path"
            >
              <PlusIcon />
              <Trans message="Add album" />
            </LinkButton>
          ) : (
            <Button
              variant="outline"
              color="primary"
              size="sm"
              className="ml-auto"
              disabled
            >
              <PlusIcon />
              <Trans message="Add album" />
            </Button>
          )}
        </div>

        {!artistId && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <InfoIcon className="size-3.5 shrink-0" />
            <Trans message="Save changes to enable album creation." />
          </div>
        )}
      </div>

      <div className="mb-4">
        <TableSearchInput className="mr-auto" debounce={false} />
      </div>

      {(!isEmpty || isFiltering) && <GenericTable table={table} />}
      {isEmpty ? <AlbumsEmptyState isFiltering={isFiltering} /> : null}
      <TablePagination table={table} />
    </div>
  );
}

function AlbumsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root className="mt-6">
      <Empty.Header>
        <Empty.Media variant="icon">
          <Disc3Icon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching albums" />
          ) : (
            <Trans message="This artist does not have any albums yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query." />
          ) : (
            <Trans message="Get started by adding the first album." />
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  );
}

interface RowActionsProps {
  album: FullAlbum;
}
function RowActions({album}: RowActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="text-muted-foreground flex justify-end">
      <DeleteAlbumDialog
        albumId={album.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
      <LinkButton
        variant="ghost"
        size="icon"
        to={`../../../albums/${album.id}/edit`}
        relative="path"
      >
        <PencilIcon />
      </LinkButton>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}

type DeleteAlbumDialogProps = {
  albumId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
function DeleteAlbumDialog({
  albumId,
  open,
  onOpenChange,
}: DeleteAlbumDialogProps) {
  const deleteAlbum = useDeleteAlbum();

  const handleDelete = () => {
    deleteAlbum.mutate(
      {albumId},
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Content size="sm">
          <AlertDialog.Header>
            <AlertDialog.Media>
              <Disc3Icon />
            </AlertDialog.Media>
            <AlertDialog.Title>
              <Trans message="Delete album" />
            </AlertDialog.Title>
            <AlertDialog.Description>
              <Trans message="Are you sure you want to delete this album?" />
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={deleteAlbum.isPending}>
              <Trans message="Cancel" />
            </AlertDialog.Cancel>
            <AlertDialog.Action
              color="danger"
              disabled={deleteAlbum.isPending}
              onClick={handleDelete}
            >
              <Trans message="Delete" />
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
