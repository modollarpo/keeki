import {useTrackSeekbar} from '@app/web-player/player-controls/seekbar/use-track-seekbar';
import {Track} from '@app/web-player/tracks/track';
import {Slider} from '@ui/forms/slider/slider';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import clsx from 'clsx';

interface TrackSeekbarProps {
  track: Track;
  queue?: Track[];
  className?: string;
}
export function TrackSeekbar({track, queue, className}: TrackSeekbarProps) {
  const {duration, ...sliderProps} = useTrackSeekbar(track, queue);

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className="text-muted-foreground min-w-10 shrink-0 text-right text-xs">
        {sliderProps.value ? (
          <FormattedDuration seconds={sliderProps.value} />
        ) : (
          '0:00'
        )}
      </div>
      <Slider
        trackColor="neutral"
        thumbSize="w-3.5 h-3.5"
        showThumbOnHoverOnly={true}
        className="flex-auto"
        width="w-auto"
        {...sliderProps}
      />
      <div className="text-muted-foreground min-w-10 shrink-0 text-xs">
        <FormattedDuration seconds={duration} />
      </div>
    </div>
  );
}
