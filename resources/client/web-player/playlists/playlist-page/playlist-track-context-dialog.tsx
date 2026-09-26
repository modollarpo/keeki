import {
  ContextMenuButton,
  ContextMenuLayoutProps,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {useRemoveTracksFromPlaylist} from '@app/web-player/playlists/requests/use-remove-tracks-from-playlist';
import {TableTrackContextDialog} from '@app/web-player/tracks/context-dialog/table-track-context-dialog';
import {Track} from '@app/web-player/tracks/track';
import {useAuth} from '@common/auth/use-auth';
import {Trans} from '@ui/i18n/trans';
import {ListMinusIcon} from 'lucide-react';

interface PlaylistTrackContextDialogProps {
  playlist: PartialPlaylist;
  type: ContextMenuLayoutProps['type'];
}
export function PlaylistTrackContextDialog({
  playlist,
  type,
}: PlaylistTrackContextDialogProps) {
  return (
    <TableTrackContextDialog type={type}>
      {tracks => (
        <RemoveFromPlaylistMenuItem playlist={playlist} tracks={tracks} />
      )}
    </TableTrackContextDialog>
  );
}

interface RemoveFromPlaylistMenuItemProps {
  playlist: PartialPlaylist;
  tracks: Track[];
}
export function RemoveFromPlaylistMenuItem({
  playlist,
  tracks,
}: RemoveFromPlaylistMenuItemProps) {
  const {user} = useAuth();
  const removeTracks = useRemoveTracksFromPlaylist();
  const canRemove = playlist.owner_id === user?.id || playlist.collaborative;

  if (!canRemove) {
    return null;
  }

  return (
    <ContextMenuButton
      startIcon={<ListMinusIcon />}
      onClick={() => {
        if (!removeTracks.isPending) {
          removeTracks.mutate({playlistId: playlist.id, tracks});
        }
      }}
    >
      <Trans message="Remove from this playlist" />
    </ContextMenuButton>
  );
}
