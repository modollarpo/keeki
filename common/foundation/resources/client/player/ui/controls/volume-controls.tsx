import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button} from '@shadcn/button/button';
import {Slider} from '@shadcn/forms/slider/slider';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {MediaMuteIcon} from '@ui/icons/media/media-mute';
import {MediaVolumeHighIcon} from '@ui/icons/media/media-volume-high';
import {MediaVolumeLowIcon} from '@ui/icons/media/media-volume-low';
import {cn} from '@ui/utils/cn';

interface Props {
  trackClassName?: string;
  indicatorClassName?: string;
  thumbClassName?: string;
  buttonClassName?: string;
  className?: string;
}
export function VolumeControls({
  trackClassName,
  indicatorClassName,
  thumbClassName,
  buttonClassName,
  className,
}: Props) {
  const volume = usePlayerStore(s => s.volume);
  const player = usePlayerActions();
  const playerReady = usePlayerStore(s => s.providerReady);

  return (
    <div className={cn('flex w-min shrink-0 items-center gap-1', className)}>
      <ToggleMuteButton className={buttonClassName} />
      <Slider
        disabled={!playerReady}
        min={0}
        max={100}
        className="flex-auto data-horizontal:w-24"
        value={volume}
        onValueChange={next => {
          player.setVolume(next as number);
        }}
      >
        <Slider.Control className="group">
          <Slider.Track className={cn('data-horizontal:h-1', trackClassName)}>
            <Slider.Indicator className={indicatorClassName} />
            <Slider.Thumb
              aria-label="Volume"
              className={cn(
                'size-3.5 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 group-data-dragging:opacity-100',
                thumbClassName,
              )}
            />
          </Slider.Track>
        </Slider.Control>
      </Slider>
    </div>
  );
}

export function ToggleMuteButton({className}: {className?: string}) {
  const isMuted = usePlayerStore(s => s.muted);
  const volume = usePlayerStore(s => s.volume);
  const player = usePlayerActions();
  const playerReady = usePlayerStore(s => s.providerReady);

  if (isMuted) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Button
              disabled={!playerReady}
              variant="ghost"
              size="icon"
              className={className}
            />
          }
          onClick={() => player.setMuted(false)}
        >
          <MediaMuteIcon className="size-6" />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Trans message="Unmute" />
        </Tooltip.Content>
      </Tooltip.Root>
    );
  }
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            disabled={!playerReady}
            variant="ghost"
            size="icon"
            className={className}
          />
        }
        onClick={() => player.setMuted(true)}
      >
        {volume < 40 ? (
          <MediaVolumeLowIcon className="size-6" />
        ) : (
          <MediaVolumeHighIcon className="size-6" />
        )}
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Trans message="Mute" />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
