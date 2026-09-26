import {PartialAlbum} from '@app/web-player/albums/album';
import {PartialArtist} from '@app/web-player/artists/artist';
import {ContextMenuButton} from '@app/web-player/context-dialog/context-dialog-layout';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {Track} from '@app/web-player/tracks/track';
import {tracksToMediaItems} from '@app/web-player/tracks/utils/track-to-media-item';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {Trans} from '@ui/i18n/trans';
import {ListEndIcon} from 'lucide-react';

type MediaItem = Track | PartialAlbum | PartialArtist | PartialPlaylist;

interface AddToQueueButtonProps {
  item: MediaItem | null;
  loadTracks: () => Promise<Track[]>;
}
export function AddToQueueButton({item, loadTracks}: AddToQueueButtonProps) {
  const player = usePlayerActions();

  return (
    <ContextMenuButton
      enableWhileOffline
      startIcon={<ListEndIcon />}
      onClick={async () => {
        const tracks = await loadTracks();
        player.appendToQueue(
          await tracksToMediaItems(
            tracks,
            item ? queueGroupId(item) : undefined,
          ),
        );
      }}
    >
      <Trans message="Add to queue" />
    </ContextMenuButton>
  );
}
