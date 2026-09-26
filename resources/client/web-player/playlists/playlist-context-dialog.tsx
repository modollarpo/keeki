import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {useCanOffline} from '@app/offline/use-can-offline';
import {AddToQueueButton} from '@app/web-player/context-dialog/add-to-queue-menu-button';
import {
  ContextDialogLayout,
  ContextMenuButton,
  ContextMenuLayoutProps,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {CopyLinkMenuButton} from '@app/web-player/context-dialog/copy-link-menu-button';
import {DeleteConfirmationAlert} from '@app/web-player/context-dialog/delete-confirmation-alert';
import {ShareMediaButton} from '@app/web-player/context-dialog/share-media-button';
import {UpdatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/update-playlist-dialog';
import {useIsFollowingPlaylist} from '@app/web-player/playlists/hooks/use-is-following-playlist';
import {usePlaylistPermissions} from '@app/web-player/playlists/hooks/use-playlist-permissions';
import {
  FullPlaylist,
  PartialPlaylist,
} from '@app/web-player/playlists/playlist';
import {PlaylistOwnerName} from '@app/web-player/playlists/playlist-grid-item';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {
  PlaylistLink,
  getPlaylistLink,
} from '@app/web-player/playlists/playlist-link';
import {useDeletePlaylist} from '@app/web-player/playlists/requests/use-delete-playlist';
import {useFollowPlaylist} from '@app/web-player/playlists/requests/use-follow-playlist';
import {useUnfollowPlaylist} from '@app/web-player/playlists/requests/use-unfollow-playlist';
import {useUpdatePlaylist} from '@app/web-player/playlists/requests/use-update-playlist';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {loadMediaItemTracks} from '@app/web-player/requests/load-media-item-tracks';
import {Track} from '@app/web-player/tracks/track';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {
  CheckIcon,
  CloudOffIcon,
  GlobeIcon,
  HardDriveDownloadIcon,
  HeartIcon,
  HeartOffIcon,
  ListMusicIcon,
  LockIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import {Fragment, useCallback, useState} from 'react';

interface PlaylistContextDialogProps {
  playlist: PartialPlaylist | FullPlaylist;
  type: ContextMenuLayoutProps['type'];
}
export function PlaylistContextDialog({
  playlist,
  type,
}: PlaylistContextDialogProps) {
  const {canEdit, canDelete} = usePlaylistPermissions(playlist);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadTracks = useCallback(() => {
    return loadPlaylistTracks(playlist);
  }, [playlist]);

  return (
    <>
      <UpdatePlaylistDialog
        playlist={playlist}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
      />
      {canDelete && (
        <DeletePlaylistAlert
          playlistId={playlist.id}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
      <ContextDialogLayout
        image={<PlaylistImage playlist={playlist} />}
        title={<PlaylistLink playlist={playlist} />}
        description={<PlaylistOwnerName playlist={playlist} />}
        loadTracks={loadTracks}
        type={type}
        item={playlist}
      >
        <AddToQueueButton item={playlist} loadTracks={loadTracks} />
        <TogglePublicButton playlist={playlist} />
        <ToggleCollaborativeButton playlist={playlist} />
        <FollowButtons playlist={playlist} />
        <OfflinePlaylistButton playlist={playlist} />
        <CopyLinkMenuButton link={getPlaylistLink(playlist, {absolute: true})}>
          <Trans message="Copy playlist link" />
        </CopyLinkMenuButton>
        {playlist.public && <ShareMediaButton />}
        {canEdit && (
          <ContextMenuButton
            startIcon={<PencilIcon />}
            onClick={() => setUpdateOpen(true)}
          >
            <Trans message="Edit" />
          </ContextMenuButton>
        )}
        {canDelete && (
          <ContextMenuButton
            startIcon={<Trash2Icon />}
            onClick={() => setDeleteOpen(true)}
          >
            <Trans message="Delete" />
          </ContextMenuButton>
        )}
      </ContextDialogLayout>
    </>
  );
}

interface FollowButtonsProps {
  playlist: PartialPlaylist;
}
function FollowButtons({playlist}: FollowButtonsProps) {
  const isFollowing = useIsFollowingPlaylist(playlist.id);
  const followPlaylist = useFollowPlaylist(playlist);
  const unFollowPlaylist = useUnfollowPlaylist(playlist);
  const {isCreator} = usePlaylistPermissions(playlist);

  // if user has created this playlist, bail
  if (isCreator) {
    return null;
  }

  return (
    <Fragment>
      {!isFollowing ? (
        <ContextMenuButton
          startIcon={<HeartIcon />}
          onClick={() => followPlaylist.mutate()}
        >
          <Trans message="Follow" />
        </ContextMenuButton>
      ) : (
        <ContextMenuButton
          startIcon={<HeartOffIcon />}
          onClick={() => unFollowPlaylist.mutate()}
        >
          <Trans message="Unfollow" />
        </ContextMenuButton>
      )}
    </Fragment>
  );
}

type OfflinePlaylistButtonProps = {
  playlist: PartialPlaylist | FullPlaylist;
};
function OfflinePlaylistButton({playlist}: OfflinePlaylistButtonProps) {
  const canOffline = useCanOffline();
  const isOfflined = useOfflineEntitiesStore(s =>
    s.offlinedPlaylistIds.has(playlist.id),
  );

  if (!canOffline) {
    return null;
  }

  return (
    <ContextMenuButton
      enableWhileOffline
      startIcon={isOfflined ? <CloudOffIcon /> : <HardDriveDownloadIcon />}
      onClick={async () => {
        if (isOfflined) {
          offlinedEntitiesStore().deleteOfflinedMediaItem(playlist);
        } else {
          offlinedEntitiesStore().offlineMediaItem(playlist);
        }
      }}
    >
      {isOfflined ? (
        <Trans message="Remove from this device" />
      ) : (
        <Trans message="Make available offline" />
      )}
    </ContextMenuButton>
  );
}

function TogglePublicButton({playlist}: FollowButtonsProps) {
  const updatePlaylist = useUpdatePlaylist({playlistId: playlist.id});
  const {isCreator} = usePlaylistPermissions(playlist);

  if (!isCreator) {
    return null;
  }

  return (
    <ContextMenuButton
      disabled={updatePlaylist.isPending}
      startIcon={playlist.public ? <LockIcon /> : <GlobeIcon />}
      onClick={() => {
        updatePlaylist.mutate({public: !playlist.public});
      }}
    >
      {playlist.public ? (
        <Trans message="Make private" />
      ) : (
        <Trans message="Make public" />
      )}
    </ContextMenuButton>
  );
}

function ToggleCollaborativeButton({playlist}: FollowButtonsProps) {
  const updatePlaylist = useUpdatePlaylist({playlistId: playlist.id});
  const {isCreator} = usePlaylistPermissions(playlist);

  if (!isCreator) {
    return null;
  }

  return (
    <ContextMenuButton
      disabled={updatePlaylist.isPending}
      startIcon={<UsersIcon />}
      endIcon={playlist.collaborative ? <CheckIcon /> : undefined}
      onClick={() => {
        updatePlaylist.mutate({collaborative: !playlist.collaborative});
      }}
    >
      <Trans message="Collaborative" />
    </ContextMenuButton>
  );
}

function DeletePlaylistAlert({
  playlistId,
  open,
  onOpenChange,
}: {
  playlistId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deletePlaylist = useDeletePlaylist(playlistId);

  return (
    <DeleteConfirmationAlert
      open={open}
      onOpenChange={onOpenChange}
      icon={<ListMusicIcon />}
      title={<Trans message="Delete playlist" />}
      description={
        <Trans message="Are you sure you want to delete this playlist?" />
      }
      isPending={deletePlaylist.isPending}
      onConfirm={() => {
        deletePlaylist.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        });
      }}
    />
  );
}

async function loadPlaylistTracks(playlist: PartialPlaylist): Promise<Track[]> {
  const tracks = await loadMediaItemTracks(queueGroupId(playlist));
  if (!tracks.length) {
    toast.success(<Trans message="This playlist has no tracks yet." />);
  }
  return tracks;
}
