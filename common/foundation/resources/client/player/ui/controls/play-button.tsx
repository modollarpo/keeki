import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button, ButtonSize} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {MediaPauseIcon} from '@ui/icons/media/media-pause';
import {MediaPlayIcon} from '@ui/icons/media/media-play';
import {cn} from '@ui/utils/cn';

interface Props {
  className?: string;
  iconClassName?: string;
  stopPropagation?: boolean;
  size?: ButtonSize;
}
export function PlayButton({
  className,
  iconClassName,
  stopPropagation,
  size = 'icon',
}: Props) {
  const isPlaying = usePlayerStore(s => s.isPlaying);
  const playerReady = usePlayerStore(s => s.providerReady);
  const player = usePlayerActions();

  const label = isPlaying ? (
    <Trans message="Pause (k)" />
  ) : (
    <Trans message="Play (k)" />
  );

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            variant="ghost"
            size={size}
            className={className}
            disabled={!playerReady}
          />
        }
        onClick={e => {
          if (stopPropagation) {
            e.stopPropagation();
          }
          if (isPlaying) {
            player.pause();
          } else {
            player.play();
          }
        }}
      >
        {isPlaying ? (
          <MediaPauseIcon className={cn('size-6', iconClassName)} />
        ) : (
          <MediaPlayIcon className={cn('size-6', iconClassName)} />
        )}
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip.Root>
  );
}
