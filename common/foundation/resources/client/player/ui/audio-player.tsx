import {MediaItem} from '@common/player/media-item';
import {PlayerContext} from '@common/player/player-context';
import {PlayerStoreOptions} from '@common/player/state/player-store-options';
import {FormattedCurrentTime} from '@common/player/ui/controls/formatted-current-time';
import {FormattedPlayerDuration} from '@common/player/ui/controls/formatted-player-duration';
import {PlayButton} from '@common/player/ui/controls/play-button';
import {PlaybackOptionsButton} from '@common/player/ui/controls/playback-options-button';
import {SeekButton} from '@common/player/ui/controls/seeking/seek-button';
import {Seekbar} from '@common/player/ui/controls/seeking/seekbar';
import {VolumeControls} from '@common/player/ui/controls/volume-controls';
import {PlayerOutlet} from '@common/player/ui/player-outlet';
import {guessPlayerProvider} from '@common/player/utils/guess-player-provider';
import clsx from 'clsx';
import {Redo2Icon, Undo2Icon} from 'lucide-react';
import {Fragment} from 'react';

interface Props {
  id: string;
  queue?: MediaItem[];
  cuedMediaId?: string;
  autoPlay?: boolean;
  listeners?: PlayerStoreOptions['listeners'];
  src?: string;
  className?: string;
}
export function AudioPlayer({
  id,
  queue,
  cuedMediaId,
  autoPlay,
  src,
  className,
}: Props) {
  return (
    <PlayerContext
      id={id}
      options={{
        autoPlay,
        initialData: {
          queue: queue ? queue : [mediaItemFromSrc(src!)],
          cuedMediaId,
        },
      }}
    >
      <div className={clsx(className, 'rounded-sm shadow-sm')}>
        <Player />
      </div>
    </PlayerContext>
  );
}

function Player() {
  return (
    <Fragment>
      <PlayerOutlet className="h-full w-full" />
      <Controls />
    </Fragment>
  );
}

function Controls() {
  return (
    <div className="flex items-center gap-6 p-3.5 text-sm">
      <div className="flex items-center gap-1">
        <SeekButton seconds="-15">
          <Undo2Icon />
        </SeekButton>
        <PlayButton />
        <SeekButton seconds="+15">
          <Redo2Icon />
        </SeekButton>
      </div>
      <FormattedCurrentTime className="min-w-10 text-right" />
      <Seekbar
        indicatorClassName="bg-black"
        thumbClassName="bg-black"
        trackClassName="bg-black/20"
      />
      <FormattedPlayerDuration className="min-w-10 text-right" />
      <div className="flex items-center gap-1">
        <PlaybackOptionsButton />
        <VolumeControls
          indicatorClassName="bg-black"
          thumbClassName="bg-black"
          trackClassName="bg-black/20"
        />
      </div>
    </div>
  );
}

function mediaItemFromSrc(src: string): MediaItem {
  return {
    id: src,
    src,
    provider: guessPlayerProvider(src),
  };
}
