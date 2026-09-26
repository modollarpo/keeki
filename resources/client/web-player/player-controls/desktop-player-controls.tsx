import {ArtistContextDialog} from '@app/web-player/artists/artist-context-dialog';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {DownloadTrackButton} from '@app/web-player/player-controls/download-track-button';
import {LyricsButton} from '@app/web-player/player-controls/lyrics-button';
import {PlaybackControls} from '@app/web-player/player-controls/playback-controls';
import {useCuedTrack} from '@app/web-player/player-controls/use-cued-track';
import {
  playerOverlayState,
  usePlayerOverlayStore,
} from '@app/web-player/state/player-overlay-store';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink, TrackLink} from '@app/web-player/tracks/track-link';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {VolumeControls} from '@common/player/ui/controls/volume-controls';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {Button} from '@shadcn/button/button';
import {ContextMenu} from '@shadcn/context-menu/context-menu';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {MediaQueueListIcon} from '@ui/icons/media/media-queue-list';
import {useSettings} from '@ui/settings/use-settings';
import {ChevronDownIcon, ChevronUpIcon} from 'lucide-react';
import {ReactNode, use} from 'react';
import {Link} from 'react-router';

export function DesktopPlayerControls() {
  const mediaIsCued = usePlayerStore(s => s.cuedMedia != null);
  if (!mediaIsCued) return null;

  return (
    <DashboardLayout.Section className="bg-card z-30 h-24 shrink-0 flex-row items-center justify-between px-4">
      <QueuedTrack />
      <PlaybackControls className="w-2/5 max-w-180" />
      <SecondaryControls />
    </DashboardLayout.Section>
  );
}

function QueuedTrack() {
  const track = useCuedTrack();
  let content: ReactNode;

  if (track) {
    content = (
      <div className="flex items-center gap-3.5">
        <ContextMenu>
          <ContextMenu.Trigger>
            <Link to={getTrackLink(track)} className="shrink-0">
              <TrackImage
                className="size-14 rounded object-cover"
                track={track}
              />
            </Link>
          </ContextMenu.Trigger>
          <TrackContextDialog tracks={[track]} type="contextMenu" />
        </ContextMenu>
        <div className="min-w-0 overflow-hidden text-ellipsis">
          <ContextMenu>
            <ContextMenu.Trigger>
              <TrackLink
                track={track}
                className="max-w-full min-w-0 text-sm whitespace-nowrap"
              />
            </ContextMenu.Trigger>
            <TrackContextDialog tracks={[track]} type="contextMenu" />
          </ContextMenu>
          {track.artists?.length ? (
            <ContextMenu>
              <ContextMenu.Trigger className="text-muted-foreground text-xs">
                <ArtistLinks
                  artists={track.artists}
                  className="whitespace-nowrap"
                />
              </ContextMenu.Trigger>
              <ArtistContextDialog
                artist={track.artists[0]}
                type="contextMenu"
              />
            </ContextMenu>
          ) : null}
        </div>
        <LikeIconButton likeable={track} />
      </div>
    );
  } else {
    content = null;
  }

  return <div className="w-[30%] min-w-45">{content}</div>;
}

function SecondaryControls() {
  const {rightSidebar} = use(DashboardLayoutContext);
  return (
    <div className="flex w-[30%] min-w-45 items-center justify-end">
      <LyricsButton />
      <DownloadTrackButton />
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                rightSidebar.toggleStatus();
              }}
            />
          }
        >
          <MediaQueueListIcon className="size-6" />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Trans message="Queue" />
        </Tooltip.Content>
      </Tooltip.Root>
      <VolumeControls trackClassName="bg-secondary" />
      <OverlayButton />
    </div>
  );
}

function OverlayButton() {
  const isActive = usePlayerOverlayStore(s => s.isMaximized);
  const playerReady = usePlayerStore(s => s.providerReady);
  const {player} = useSettings();

  if (player?.hide_video_button) {
    return null;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            className="bg-secondary text-foreground border-secondary hover:bg-secondary/80 ml-6.5 shrink-0"
            variant="default"
            size="icon"
            disabled={!playerReady}
            onClick={() => {
              playerOverlayState.toggle();
            }}
          />
        }
      >
        {isActive ? <ChevronDownIcon /> : <ChevronUpIcon />}
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Trans message="Expand" />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
