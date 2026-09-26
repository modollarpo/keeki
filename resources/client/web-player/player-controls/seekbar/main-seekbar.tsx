import {FormattedCurrentTime} from '@common/player/ui/controls/formatted-current-time';
import {FormattedPlayerDuration} from '@common/player/ui/controls/formatted-player-duration';
import {Seekbar} from '@common/player/ui/controls/seeking/seekbar';
import {Fragment} from 'react';

export function MainSeekbar() {
  return (
    <Fragment>
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground min-w-10 shrink-0 text-right text-xs">
          <FormattedCurrentTime />
        </div>
        <Seekbar className="flex-auto" trackClassName="bg-secondary" />
        <div className="text-muted-foreground min-w-10 shrink-0 text-xs">
          <FormattedPlayerDuration />
        </div>
      </div>
    </Fragment>
  );
}
