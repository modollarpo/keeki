import {
  ContextMenuButton,
  ContextMenuLayoutProps,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {MediaItem} from '@common/player/media-item';
import {Trans} from '@ui/i18n/trans';
import {ListXIcon} from 'lucide-react';

interface Props {
  queueItems: MediaItem[];
  type?: ContextMenuLayoutProps['type'];
}
export function QueueTrackContextDialog({
  queueItems,
  type = 'contextMenu',
}: Props) {
  return (
    <TrackContextDialog
      tracks={queueItems.map(item => item.meta)}
      showAddToQueueButton={false}
      type={type}
    >
      {() => <RemoveFromQueueContextButton queueItems={queueItems} />}
    </TrackContextDialog>
  );
}

interface RemoveFromQueueContextButton {
  queueItems: MediaItem[];
}
function RemoveFromQueueContextButton({
  queueItems,
}: RemoveFromQueueContextButton) {
  const player = usePlayerActions();

  return (
    <ContextMenuButton
      startIcon={<ListXIcon />}
      onClick={() => {
        player.removeFromQueue(queueItems);
      }}
    >
      <Trans message="Remove from queue" />
    </ContextMenuButton>
  );
}
