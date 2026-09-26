import {UpdatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/update-playlist-dialog';
import {
  FullPlaylist,
  PartialPlaylist,
} from '@app/web-player/playlists/playlist';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {PlaylistLink} from '@app/web-player/playlists/playlist-link';
import {UserProfileLink} from '@app/web-player/users/user-profile-link';
import {Avatar} from '@shadcn/avatar/avatar';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {checkboxColumnDef} from '@shadcn/table/utils/checkbox-column-def';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {CheckIcon, PencilIcon} from 'lucide-react';

export const playlistDatatableColumns: ColumnDef<FullPlaylist>[] = [
  checkboxColumnDef<FullPlaylist>(),
  {
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 280,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Playlist" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const playlist = row.original;
      return (
        <div className="flex min-w-0 items-center gap-2">
          <PlaylistImage
            playlist={playlist}
            className="shrink-0"
            size="size-8 rounded-md"
          />
          <PlaylistLink playlist={playlist} className="truncate" />
        </div>
      );
    },
  },
  {
    id: 'owner',
    enableSorting: false,
    size: 200,
    header: () => <Trans message="Owner" />,
    cell: ({row}) => {
      const owner = getPlaylistOwner(row.original);
      if (!owner) return null;
      return (
        <div className="flex min-w-0 items-center gap-2">
          <Avatar.Root className="size-6">
            <Avatar.Image src={owner.image ?? undefined} alt={owner.name} />
            <Avatar.ColorFallback>{owner.name}</Avatar.ColorFallback>
          </Avatar.Root>
          <UserProfileLink
            user={owner}
            className="truncate"
            target="_blank"
            onClick={e => e.stopPropagation()}
          />
        </div>
      );
    },
  },
  {
    id: 'public',
    accessorKey: 'public',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Public" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.public ? (
        <CheckIcon className="text-muted-foreground size-4" />
      ) : null,
  },
  {
    id: 'collaborative',
    accessorKey: 'collaborative',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Collaborative" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.collaborative ? (
        <CheckIcon className="text-muted-foreground size-4" />
      ) : null,
  },
  {
    id: 'views',
    accessorKey: 'views',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Views" />
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
    cell: ({row}) => <PlaylistActionsButton playlist={row.original} />,
  },
];

export function getPlaylistOwner(playlist: PartialPlaylist) {
  return playlist.editors.find(editor => editor.id === playlist.owner_id);
}

export function PlaylistActionsButton({playlist}: {playlist: FullPlaylist}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <UpdatePlaylistDialog playlist={playlist}>
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
      </UpdatePlaylistDialog>
    </div>
  );
}
