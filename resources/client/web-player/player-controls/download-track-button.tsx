import {useCuedTrack} from '@app/web-player/player-controls/use-cued-track';
import {trackIsLocallyUploaded} from '@app/web-player/tracks/utils/track-is-locally-uploaded';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {useAuth} from '@common/auth/use-auth';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {downloadFileFromUrl} from '@ui/utils/files/download-file-from-url';
import {DownloadIcon} from 'lucide-react';

export function DownloadTrackButton() {
  const {player, base_url} = useSettings();
  const track = useCuedTrack();
  const {hasPermission} = useAuth();
  const isOffline = useIsOffline();

  if (
    !player?.enable_download ||
    !track ||
    !trackIsLocallyUploaded(track) ||
    !hasPermission('music.download') ||
    isOffline
  ) {
    return null;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              downloadFileFromUrl(`${base_url}/tracks/${track.id}/download`);
            }}
          />
        }
      >
        <DownloadIcon className="size-5" />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Trans message="Download" />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
