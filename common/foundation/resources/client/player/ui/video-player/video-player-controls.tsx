import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {FormattedCurrentTime} from '@common/player/ui/controls/formatted-current-time';
import {FormattedPlayerDuration} from '@common/player/ui/controls/formatted-player-duration';
import {FullscreenButton} from '@common/player/ui/controls/fullscreen-button';
import {NextButton} from '@common/player/ui/controls/next-button';
import {PipButton} from '@common/player/ui/controls/pip-button';
import {PlayButton} from '@common/player/ui/controls/play-button';
import {PlaybackOptionsButton} from '@common/player/ui/controls/playback-options-button';
import {Seekbar} from '@common/player/ui/controls/seeking/seekbar';
import {ToggleCaptionsButton} from '@common/player/ui/controls/toggle-captions-button';
import {
  ToggleMuteButton,
  VolumeControls,
} from '@common/player/ui/controls/volume-controls';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import clsx from 'clsx';
import {Fragment, ReactNode} from 'react';

interface Props {
  rightActions?: ReactNode;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}
export function VideoPlayerControls(props: Props) {
  const isMobile = useIsMobileMediaQuery();
  const controlsVisible = usePlayerStore(s => s.controlsVisible);

  const className = clsx(
    'player-bottom-text-shadow absolute z-40 text-white/87 transition-opacity duration-300',
    controlsVisible ? 'opacity-100' : 'opacity-0',
  );

  return isMobile ? (
    <MobileControls className={className} {...props} />
  ) : (
    <DesktopControls className={className} {...props} />
  );
}

interface ResponsiveControlsProps extends Props {
  className: string;
}
function DesktopControls({
  onPointerEnter,
  onPointerLeave,
  rightActions,
  className,
}: ResponsiveControlsProps) {
  return (
    <div
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={e => e.stopPropagation()}
      className={clsx('right-0 bottom-0 left-0 p-2', className)}
    >
      <Seekbar trackClassName="bg-white/40" />
      <div className="flex w-full items-center gap-1">
        <PlayButton className="bg-white text-black hover:bg-white" />
        <NextButton className="bg-white text-black hover:bg-white" />
        <VolumeControls
          className="max-md:hidden"
          indicatorClassName="bg-white"
          thumbClassName="bg-white"
          trackClassName="bg-white/20"
          buttonClassName="bg-white text-black hover:bg-white"
        />
        <span className="ml-2.5 text-sm">
          <FormattedCurrentTime className="min-w-10 text-right" /> /{' '}
          <FormattedPlayerDuration className="min-w-10 text-right" />
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {rightActions}
          <ToggleCaptionsButton color="white" />
          <PlaybackOptionsButton color="white" />
          <FullscreenButton className="ml-auto" color="white" />
          <PipButton color="white" />
        </div>
      </div>
    </div>
  );
}

function MobileControls({
  rightActions,
  onPointerEnter,
  onPointerLeave,
  className,
}: ResponsiveControlsProps) {
  return (
    <Fragment>
      <div
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={e => e.stopPropagation()}
        className={clsx('top-0 right-0 left-0 px-1.5 pt-1.5', className)}
      >
        <div className="flex items-end justify-end">
          {rightActions}
          <ToggleCaptionsButton color="white" />
          <PlaybackOptionsButton color="white" />
          <PipButton color="white" />
          <ToggleMuteButton className="bg-white text-black hover:bg-white" />
        </div>
      </div>
      <div
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={e => e.stopPropagation()}
        className={clsx('right-0 bottom-0 left-0 px-3', className)}
      >
        <div className="flex items-end gap-6">
          <div className="text-sm">
            <FormattedCurrentTime className="min-w-10 text-right" /> /{' '}
            <FormattedPlayerDuration className="min-w-10 text-right" />
          </div>
          <FullscreenButton
            size="icon-lg"
            color="white"
            className="ml-auto"
          />
        </div>
        <Seekbar trackClassName="bg-white/40" />
      </div>
    </Fragment>
  );
}
