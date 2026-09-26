import {TrackOfflinedIndicator} from '@app/offline/entitiy-offline-indicator-icon';
import {useOfflineEntitiesStore} from '@app/offline/offline-entities-store';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {QueueTrackContextDialog} from '@app/web-player/layout/queue/queue-track-context-dialog';
import {useMiniPlayerIsHidden} from '@app/web-player/overlay/use-mini-player-is-hidden';
import {EqualizerImage} from '@app/web-player/tracks/equalizer-image/equalizer-image';
import {PlayArrowFilledIcon} from '@app/web-player/tracks/play-arrow-filled';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {useIsMediaPlaying} from '@common/player/hooks/use-is-media-playing';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {MediaItem} from '@common/player/media-item';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {Sidebar} from '@common/ui/dashboard/sidebar';
import {Button} from '@shadcn/button/button';
import {ContextMenu} from '@shadcn/context-menu/context-menu';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {CloseIcon} from '@ui/icons/material/Close';
import {PauseIcon} from '@ui/icons/material/Pause';
import {cn} from '@ui/utils/cn';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';
import clsx from 'clsx';
import {ReactElement, use, useState} from 'react';

export function QueueSidenav() {
  const queue = usePlayerStore(s => s.shuffledQueue);
  const isOverlay = useMediaQuery('(max-width: 1280px)');
  const {rightSidebar} = use(DashboardLayoutContext);
  const miniPlayerIsHidden = useMiniPlayerIsHidden();

  if (!queue.length) {
    return null;
  }

  return (
    <Sidebar.Root
      variant="floating"
      className="bg-card"
      side="right"
      width="w-64"
      forceOverlayMode={!!isOverlay}
    >
      <Sidebar.Header className="border-border/80 flex-row items-center justify-between gap-2.5 border-b py-1.5 pr-1.5 pl-3.5 text-sm font-semibold">
        <Trans message="Queue" />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => rightSidebar.setStatus('collapsed')}
        >
          <CloseIcon />
        </Button>
      </Sidebar.Header>
      <Sidebar.Content
        className={cn(
          'gap-0 overflow-x-hidden',
          miniPlayerIsHidden ? 'h-full' : 'h-[calc(100%-256px)] flex-initial',
        )}
      >
        {queue.map((media: MediaItem<Track>, index) => (
          // same media.id might be multiple times in the queue, use index as well to avoid errors
          <QueueItem key={`${media.id}-${index}`} media={media} />
        ))}
      </Sidebar.Content>
    </Sidebar.Root>
  );
}

interface QueueItemProps {
  media: MediaItem<Track>;
}
function QueueItem({media}: QueueItemProps) {
  const isCued = usePlayerStore(s => s.cuedMedia?.id === media.id);
  const isPlaying = useIsMediaPlaying(media.id);
  const [isHover, setHover] = useState(false);
  const isOffline = useIsOffline();
  const trackId = media.meta?.id;
  const isOfflined = useOfflineEntitiesStore(s =>
    trackId ? s.offlinedTrackIds.has(trackId) : false,
  );

  if (!media.meta) {
    return null;
  }

  return (
    <ContextMenu>
      <ContextMenu.Trigger
        render={
          <div
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            className={clsx(
              'border-border/80 flex items-center gap-2.5 border-b p-2',
              isCued && 'bg-primary/80 text-white',
              isOffline && !isOfflined && 'pointer-events-none opacity-50',
            )}
          />
        }
      >
        <div className="relative overflow-hidden">
          <TrackImage
            className="h-8.5 w-8.5 shrink-0 rounded object-cover"
            track={media.meta}
          />
          {(isHover || isPlaying) && (
            <TogglePlaybackOverlay media={media} isHover={isHover} />
          )}
        </div>
        <div className="max-w-45 flex-auto whitespace-nowrap">
          <div className="overflow-hidden text-sm text-ellipsis">
            {media.meta.name}
          </div>
          <div className="flex items-center gap-1">
            <TrackOfflinedIndicator
              trackId={media.meta.id}
              className="text-muted-foreground"
            />
            <ArtistLinks
              className="overflow-hidden text-xs text-ellipsis"
              linkClassName={isCued ? 'text-inherit' : 'text-muted-foreground'}
              artists={media.meta.artists}
            />
          </div>
        </div>
      </ContextMenu.Trigger>
      <QueueTrackContextDialog queueItems={[media]} type="contextMenu" />
    </ContextMenu>
  );
}

interface TogglePlaybackOverlayProps {
  media: MediaItem<Track>;
  isHover: boolean;
}
function TogglePlaybackOverlay({media, isHover}: TogglePlaybackOverlayProps) {
  const isPlaying = useIsMediaPlaying(media.id);
  const {trans} = useTrans();
  const player = usePlayerActions();

  if (!media.meta) {
    return null;
  }

  let button: ReactElement;

  if (isPlaying) {
    button = (
      <button
        aria-label={trans(
          message('Pause :name', {values: {name: media.meta.name}}),
        )}
        tabIndex={0}
        onClick={() => player.pause()}
      >
        {isHover ? (
          <PauseIcon className="size-6" />
        ) : (
          <EqualizerImage color="white" />
        )}
      </button>
    );
  } else {
    button = (
      <button
        aria-label={trans(
          message('Play :name', {values: {name: media.meta.name}}),
        )}
        tabIndex={0}
        onClick={() => player.play(media)}
      >
        <PlayArrowFilledIcon className="size-6" />
      </button>
    );
  }

  return (
    <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center rounded bg-black/50 text-white">
      {button}
    </div>
  );
}
