import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {useCanOffline} from '@app/offline/use-can-offline';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {AddToPlaylistButton} from '@app/web-player/context-dialog/add-to-playlist-button';
import {AddToQueueButton} from '@app/web-player/context-dialog/add-to-queue-menu-button';
import {
  ContextDialogLayout,
  ContextMenuButton,
  ContextMenuLayoutProps,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {CopyLinkMenuButton} from '@app/web-player/context-dialog/copy-link-menu-button';
import {DeleteConfirmationAlert} from '@app/web-player/context-dialog/delete-confirmation-alert';
import {ShareMediaButton} from '@app/web-player/context-dialog/share-media-button';
import {ToggleInLibraryMenuButton} from '@app/web-player/context-dialog/toggle-in-library-menu-button';
import {ToggleRepostMenuButton} from '@app/web-player/context-dialog/toggle-repost-menu-button';
import {getRadioLink} from '@app/web-player/radio/get-radio-link';
import {useShouldShowRadioButton} from '@app/web-player/tracks/context-dialog/use-should-show-radio-button';
import {useTrackPermissions} from '@app/web-player/tracks/hooks/use-track-permissions';
import {useDeleteTracks} from '@app/web-player/tracks/requests/use-delete-tracks';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink, TrackLink} from '@app/web-player/tracks/track-link';
import {trackIsLocallyUploaded} from '@app/web-player/tracks/utils/track-is-locally-uploaded';
import {trackToMediaItem} from '@app/web-player/tracks/utils/track-to-media-item';
import {useAuth} from '@common/auth/use-auth';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {downloadFileFromUrl} from '@ui/utils/files/download-file-from-url';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {
  ChartNoAxesColumnIcon,
  CloudOffIcon,
  Disc3Icon,
  DownloadIcon,
  HardDriveDownloadIcon,
  MicVocalIcon,
  MusicIcon,
  PencilIcon,
  RadioIcon,
  TextIcon,
  Trash2Icon,
} from 'lucide-react';
import {Fragment, ReactNode, useCallback, useState} from 'react';

export interface TrackContextDialogProps {
  tracks: Track[];
  children?: (tracks: Track[]) => ReactNode;
  showAddToQueueButton?: boolean;
  type: ContextMenuLayoutProps['type'];
}
export function TrackContextDialog({
  children,
  tracks,
  showAddToQueueButton = true,
  type,
}: TrackContextDialogProps) {
  const isMobile = useIsMobileMediaQuery();
  const firstTrack = tracks[0];
  const {canEdit, canDelete} = useTrackPermissions(tracks);
  const shouldShowRadio = useShouldShowRadioButton();
  const {player} = useSettings();
  const navigate = useNavigate();
  const cuedTrack = usePlayerStore(s => s.cuedMedia?.meta as Track | undefined);
  const {play} = usePlayerActions();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadTracks = useCallback(() => {
    return Promise.resolve(tracks);
  }, [tracks]);

  const headerProps: Partial<ContextMenuLayoutProps> =
    tracks.length === 1
      ? {
          image: <TrackImage track={firstTrack} />,
          title: <TrackLink track={firstTrack} />,
          description: <ArtistLinks artists={firstTrack.artists} />,
        }
      : {};

  return (
    <>
      {canDelete && !isMobile && (
        <DeleteTracksAlert
          tracks={tracks}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
      <ContextDialogLayout
        {...headerProps}
        loadTracks={loadTracks}
        type={type}
        item={firstTrack}
      >
        {showAddToQueueButton && (
          <AddToQueueButton item={null} loadTracks={loadTracks} />
        )}
        <ToggleInLibraryMenuButton items={tracks} />
        {children?.(tracks)}
        <AddToPlaylistButton />
        {tracks.length === 1 ? (
          <Fragment>
            {shouldShowRadio && (
              <ContextMenuButton
                to={getRadioLink(firstTrack)}
                startIcon={<RadioIcon />}
              >
                <Trans message="Go to song radio" />
              </ContextMenuButton>
            )}
            {isMobile && (
              <Fragment>
                {firstTrack.artists?.[0] && (
                  <ContextMenuButton
                    to={getArtistLink(firstTrack.artists[0])}
                    startIcon={<MicVocalIcon />}
                  >
                    <Trans message="Go to artist" />
                  </ContextMenuButton>
                )}
                {firstTrack.album && (
                  <ContextMenuButton
                    to={getAlbumLink(firstTrack.album)}
                    startIcon={<Disc3Icon />}
                  >
                    <Trans message="Go to album" />
                  </ContextMenuButton>
                )}
                <ContextMenuButton
                  to={getTrackLink(firstTrack)}
                  enableWhileOffline
                  startIcon={<MusicIcon />}
                >
                  <Trans message="Go to track" />
                </ContextMenuButton>
              </Fragment>
            )}
            {!player?.hide_lyrics && tracks.length === 1 && (
              <ContextMenuButton
                startIcon={<TextIcon />}
                onClick={async () => {
                  if (cuedTrack?.id !== firstTrack.id) {
                    await play(await trackToMediaItem(firstTrack));
                  }
                  navigate('/lyrics');
                }}
              >
                <Trans message="View lyrics" />
              </ContextMenuButton>
            )}
            {!isMobile && (
              <CopyLinkMenuButton
                link={getTrackLink(firstTrack, {absolute: true})}
              >
                <Trans message="Copy song link" />
              </CopyLinkMenuButton>
            )}
            <OfflineTracksButton tracks={tracks} />
            {tracks.length === 1 && <ShareMediaButton />}
            {tracks.length === 1 && <DownloadTrackButton track={firstTrack} />}
            {tracks.length === 1 ? (
              <ToggleRepostMenuButton item={tracks[0]} />
            ) : null}
            {tracks.length === 1 && canEdit && (
              <ContextMenuButton
                to={`/backstage/tracks/${firstTrack.id}/insights`}
                startIcon={<ChartNoAxesColumnIcon />}
              >
                <Trans message="Insights" />
              </ContextMenuButton>
            )}
            {tracks.length === 1 && canEdit && (
              <ContextMenuButton
                to={`/backstage/tracks/${firstTrack.id}/edit`}
                startIcon={<PencilIcon />}
              >
                <Trans message="Edit" />
              </ContextMenuButton>
            )}
          </Fragment>
        ) : null}
        {canDelete && !isMobile && (
          <ContextMenuButton
            startIcon={<Trash2Icon />}
            onClick={() => setDeleteOpen(true)}
          >
            <Trans message="Delete" />
          </ContextMenuButton>
        )}
      </ContextDialogLayout>
    </>
  );
}

type DownloadOfflineButtonProps = {
  tracks: Track[];
};
function OfflineTracksButton({tracks}: DownloadOfflineButtonProps) {
  const canOffline = useCanOffline() && tracks.every(t => t.src);
  const allTracksOfflined = useOfflineEntitiesStore(s =>
    tracks.every(t => s.offlinedTrackIds.has(t.id)),
  );

  if (!canOffline) {
    return null;
  }

  return (
    <ContextMenuButton
      enableWhileOffline
      startIcon={
        allTracksOfflined ? <CloudOffIcon /> : <HardDriveDownloadIcon />
      }
      onClick={async () => {
        if (allTracksOfflined) {
          offlinedEntitiesStore().deleteOfflinedTracks(tracks);
        } else {
          offlinedEntitiesStore().offlineTracks(tracks);
        }
      }}
    >
      {allTracksOfflined ? (
        <Trans message="Remove from this device" />
      ) : (
        <Trans message="Make available offline" />
      )}
    </ContextMenuButton>
  );
}

interface DownloadTrackButtonProps {
  track: Track;
}
function DownloadTrackButton({track}: DownloadTrackButtonProps) {
  const {player, base_url} = useSettings();
  const {hasPermission} = useAuth();

  if (
    !player?.enable_download ||
    !track ||
    !trackIsLocallyUploaded(track) ||
    !hasPermission('music.download')
  ) {
    return null;
  }

  return (
    <ContextMenuButton
      startIcon={<DownloadIcon />}
      onClick={() => {
        downloadFileFromUrl(`${base_url}/api/v1/tracks/${track.id}/download`);
      }}
    >
      <Trans message="Download" />
    </ContextMenuButton>
  );
}

function DeleteTracksAlert({
  tracks,
  open,
  onOpenChange,
}: {
  tracks: Track[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteTracks = useDeleteTracks();

  return (
    <DeleteConfirmationAlert
      open={open}
      onOpenChange={onOpenChange}
      icon={<MusicIcon />}
      title={<Trans message="Delete tracks" />}
      description={
        <Trans message="Are you sure you want to delete selected tracks?" />
      }
      isPending={deleteTracks.isPending}
      onConfirm={() => {
        deleteTracks.mutate(
          {trackIds: tracks.map(t => t.id)},
          {onSuccess: () => onOpenChange(false)},
        );
      }}
    />
  );
}
