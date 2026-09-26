import {BufferingIndicator} from '@app/web-player/player-controls/buffering-indicator';
import {MainSeekbar} from '@app/web-player/player-controls/seekbar/main-seekbar';
import {NextButton} from '@common/player/ui/controls/next-button';
import {PlayButton} from '@common/player/ui/controls/play-button';
import {PreviousButton} from '@common/player/ui/controls/previous-button';
import {RepeatButton} from '@common/player/ui/controls/repeat-button';
import {ShuffleButton} from '@common/player/ui/controls/shuffle-button';
import {cn} from '@ui/utils/cn';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';

interface Props {
  className?: string;
}
export function PlaybackControls({className}: Props) {
  return (
    <div className={className}>
      <PlaybackButtons />
      <MainSeekbar />
    </div>
  );
}

function PlaybackButtons() {
  const isMobile = useIsMobileMediaQuery();

  // need to add a gap on mobile between buttons and seekbar, otherwise seekbar will be impossible to tap
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1.5',
        isMobile && 'mb-5',
      )}
    >
      <ShuffleButton />
      <PreviousButton iconClassName="size-6" />
      <div className="relative flex items-center justify-center">
        <BufferingIndicator />
        <PlayButton className="size-10.5" iconClassName="size-10" />
      </div>
      <NextButton iconClassName="size-6" />
      <RepeatButton />
    </div>
  );
}
