import {loadMediaItemTracks} from '@app/web-player/requests/load-media-item-tracks';
import {EqualizerImage} from '@app/web-player/tracks/equalizer-image/equalizer-image';
import {Track} from '@app/web-player/tracks/track';
import {tracksToMediaItems} from '@app/web-player/tracks/utils/track-to-media-item';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {MediaPauseIcon} from '@ui/icons/media/media-pause';
import {MediaPlayIcon} from '@ui/icons/media/media-play';
import {ComponentPropsWithoutRef, useState} from 'react';

interface PlaybackToggleButtonProps {
  queueId?: string;
  // track that should be cued
  track?: Track;
  // queue should be overwritten with these tracks
  tracks?: Track[];
  disabled?: boolean;
  className?: string;
  buttonType: 'icon' | 'text';
  equalizerColor?: 'white' | 'black';
}
export function PlaybackToggleButton({
  queueId,
  track,
  tracks,
  disabled,
  className,
  buttonType,
  equalizerColor = buttonType === 'text' ? 'white' : 'black',
}: PlaybackToggleButtonProps) {
  const [isHover, setIsHover] = useState(false);
  const modelIsQueued = usePlayerStore(s => {
    // specified queue ID is cued
    if (s.cuedMedia && queueId && s.cuedMedia.groupId === queueId) {
      return true;
    }
    // specified track is cued
    if (s.cuedMedia && track && s.cuedMedia.meta.id === track.id) {
      return true;
    }
    return false;
  });
  const isPlaying = usePlayerStore(s => s.isPlaying);
  const modelIsPlaying = isPlaying && modelIsQueued;
  const player = usePlayerActions();

  const statusIcon = modelIsPlaying ? (
    isHover ? (
      <MediaPauseIcon />
    ) : (
      <EqualizerImage color={equalizerColor} />
    )
  ) : (
    <MediaPlayIcon />
  );

  const sharedProps: ComponentPropsWithoutRef<'button'> = {
    disabled,
    onPointerEnter: () => {
      setIsHover(true);
    },
    onPointerLeave: () => {
      setIsHover(false);
    },
    onClick: async () => {
      if (modelIsPlaying) {
        player.pause();
      } else if (modelIsQueued) {
        await player.play();
      } else {
        let newQueue: Track[] = [];
        let newIndex: number = 0;
        if (tracks) {
          newQueue = [...tracks];
          newIndex = track ? tracks.findIndex(t => t.id === track.id) : 0;
        } else if (track) {
          newQueue = [track];
        } else if (queueId) {
          newQueue = await loadMediaItemTracks(queueId);
        }

        if (newQueue.length) {
          await player.overrideQueueAndPlay(
            await tracksToMediaItems(newQueue, queueId),
            newIndex,
          );
        }
      }
    },
  };

  if (buttonType === 'icon') {
    return (
      <Button
        {...sharedProps}
        variant="default"
        color="primary"
        size="icon"
        className={className}
      >
        {statusIcon}
      </Button>
    );
  }

  return (
    <Button
      {...sharedProps}
      variant="default"
      color="primary"
      className={className}
    >
      {statusIcon}
      {modelIsPlaying ? <Trans message="Pause" /> : <Trans message="Play" />}
    </Button>
  );
}
