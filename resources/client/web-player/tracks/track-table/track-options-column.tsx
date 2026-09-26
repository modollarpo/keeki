import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {RemoveFromPlaylistMenuItem} from '@app/web-player/playlists/playlist-page/playlist-track-context-dialog';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {Track} from '@app/web-player/tracks/track';
import {TrackTableContext} from '@app/web-player/tracks/track-table/track-table-context';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {cn} from '@ui/utils/cn';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {MoreHorizontalIcon, MoreVerticalIcon} from 'lucide-react';
import {useContext} from 'react';

interface Props {
  track: Track;
  isHovered: boolean;
}
export function TrackOptionsColumn({track, isHovered}: Props) {
  const isMobile = useIsMobileMediaQuery();
  const {meta} = useContext(TrackTableContext);
  return (
    <div className="flex items-center justify-end">
      <Dropdown.Root>
        <Dropdown.Trigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                isMobile ? 'text-muted-foreground size-8' : 'mr-2 size-9',
                !isMobile && !isHovered && 'invisible',
              )}
            />
          }
        >
          {isMobile ? (
            <MoreVerticalIcon className="size-5" />
          ) : (
            <MoreHorizontalIcon className="size-5" />
          )}
        </Dropdown.Trigger>
        <TrackContextDialog tracks={[track]} type="dropdown">
          {tracks =>
            meta.playlist ? (
              <RemoveFromPlaylistMenuItem
                playlist={meta.playlist}
                tracks={tracks}
              />
            ) : null
          }
        </TrackContextDialog>
      </Dropdown.Root>
      {!isMobile && <LikeIconButton likeable={track} />}
    </div>
  );
}
