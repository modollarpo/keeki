import {useCurrentTime} from '@common/player/hooks/use-current-time';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Slider} from '@shadcn/forms/slider/slider';
import {cn} from '@ui/utils/cn';
import {type PointerEvent, useRef} from 'react';

interface Props {
  trackClassName?: string;
  indicatorClassName?: string;
  thumbClassName?: string;
  className?: string;
  onPointerMove?: (e: PointerEvent) => void;
}

export function Seekbar({
  trackClassName,
  indicatorClassName,
  thumbClassName,
  className,
  onPointerMove,
}: Props) {
  const {pause, seek, setIsSeeking, play, getState} = usePlayerActions();
  const duration = usePlayerStore(s => s.mediaDuration);
  const playerReady = usePlayerStore(s => s.providerReady);
  const pauseWhileSeeking = usePlayerStore(s => s.pauseWhileSeeking);

  const currentTime = useCurrentTime();

  const wasPlayingBeforeDragging = useRef(false);

  return (
    <Slider
      className={className}
      disabled={!playerReady}
      value={currentTime}
      min={0}
      max={duration > 1 ? duration : 1}
      onValueChange={next => {
        const value = next as number;
        getState().emit('progress', {currentTime: value});
        seek(value);
      }}
      onValueCommitted={() => {
        setIsSeeking(false);
        if (pauseWhileSeeking && wasPlayingBeforeDragging.current) {
          play();
          wasPlayingBeforeDragging.current = false;
        }
      }}
    >
      <Slider.Control
        className="group"
        onPointerMove={onPointerMove}
        onPointerDown={() => {
          setIsSeeking(true);
          if (pauseWhileSeeking) {
            wasPlayingBeforeDragging.current =
              getState().isPlaying || getState().isBuffering;
            pause();
          }
        }}
      >
        <Slider.Track className={cn('data-horizontal:h-1', trackClassName)}>
          <Slider.Indicator className={indicatorClassName} />
          <Slider.Thumb
            aria-label="Seek"
            className={cn(
              'size-3.5 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 group-data-dragging:opacity-100',
              thumbClassName,
            )}
          />
        </Slider.Track>
      </Slider.Control>
    </Slider>
  );
}
