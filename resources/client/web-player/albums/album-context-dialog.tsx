import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {useCanOffline} from '@app/offline/use-can-offline';
import {FullAlbum, PartialAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink, getAlbumLink} from '@app/web-player/albums/album-link';
import {useDeleteAlbum} from '@app/web-player/albums/requests/use-delete-album';
import {useAlbumPermissions} from '@app/web-player/albums/use-album-permissions';
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
import {queueGroupId} from '@app/web-player/queue-group-id';
import {loadMediaItemTracks} from '@app/web-player/requests/load-media-item-tracks';
import {Track} from '@app/web-player/tracks/track';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {
  ChartNoAxesColumnIcon,
  CloudOffIcon,
  Disc3Icon,
  HardDriveDownloadIcon,
  MicVocalIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import {useCallback, useState} from 'react';

interface AlbumContextMenuProps {
  album: PartialAlbum | FullAlbum;
  type?: ContextMenuLayoutProps['type'];
}
export function AlbumContextDialog({album, type}: AlbumContextMenuProps) {
  const {canEdit, canDelete} = useAlbumPermissions(album);
  const isMobile = useIsMobileMediaQuery();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadTracks = useCallback(() => {
    return loadAlbumTracks(album);
  }, [album]);

  return (
    <>
      {canDelete && (
        <DeleteAlbumAlert
          album={album}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
      <ContextDialogLayout
        image={<AlbumImage album={album} />}
        title={<AlbumLink album={album} />}
        description={<ArtistLinks artists={album.artists} />}
        loadTracks={loadTracks}
        type={type}
        item={album}
      >
        <AddToQueueButton item={album} loadTracks={loadTracks} />
        <AddToPlaylistButton />
        <ToggleInLibraryMenuButton items={[album]} />
        <OfflineAlbumButton album={album} />
        {album.artists?.[0] && (
          <ContextMenuButton
            to={getArtistLink(album.artists[0])}
            className="md:hidden"
            startIcon={<MicVocalIcon />}
          >
            <Trans message="Go to artist" />
          </ContextMenuButton>
        )}
        {!isMobile && (
          <CopyLinkMenuButton link={getAlbumLink(album, {absolute: true})}>
            <Trans message="Copy album link" />
          </CopyLinkMenuButton>
        )}
        <ShareMediaButton />
        <ToggleRepostMenuButton item={album} />
        {canEdit && (
          <ContextMenuButton
            to={`/backstage/albums/${album.id}/insights`}
            startIcon={<ChartNoAxesColumnIcon />}
          >
            <Trans message="Insights" />
          </ContextMenuButton>
        )}
        {canEdit && (
          <ContextMenuButton
            to={`/backstage/albums/${album.id}/edit`}
            startIcon={<PencilIcon />}
          >
            <Trans message="Edit" />
          </ContextMenuButton>
        )}
        {canDelete && (
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

type OfflineAlbumButtonProps = {
  album: PartialAlbum | FullAlbum;
};
function OfflineAlbumButton({album}: OfflineAlbumButtonProps) {
  const canOffline = useCanOffline();
  const isOfflined = useOfflineEntitiesStore(s =>
    s.offlinedAlbumIds.has(album.id),
  );

  if (!canOffline) {
    return null;
  }

  return (
    <ContextMenuButton
      enableWhileOffline
      startIcon={isOfflined ? <CloudOffIcon /> : <HardDriveDownloadIcon />}
      onClick={async () => {
        if (isOfflined) {
          offlinedEntitiesStore().deleteOfflinedMediaItem(album);
        } else {
          offlinedEntitiesStore().offlineMediaItem(album);
        }
      }}
    >
      {isOfflined ? (
        <Trans message="Remove from this device" />
      ) : (
        <Trans message="Make available offline" />
      )}
    </ContextMenuButton>
  );
}

function DeleteAlbumAlert({
  album,
  open,
  onOpenChange,
}: {
  album: PartialAlbum | FullAlbum;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteAlbum = useDeleteAlbum();

  return (
    <DeleteConfirmationAlert
      open={open}
      onOpenChange={onOpenChange}
      icon={<Disc3Icon />}
      title={<Trans message="Delete album" />}
      description={
        <Trans message="Are you sure you want to delete this album?" />
      }
      isPending={deleteAlbum.isPending}
      onConfirm={() => {
        deleteAlbum.mutate(
          {albumId: album.id},
          {onSuccess: () => onOpenChange(false)},
        );
      }}
    />
  );
}

async function loadAlbumTracks(
  album: PartialAlbum | FullAlbum,
): Promise<Track[]> {
  // load album tracks if not loaded already
  if (typeof (album as FullAlbum).tracks === 'undefined') {
    const tracks = await loadMediaItemTracks(queueGroupId(album));
    if (!tracks.length) {
      toast.success(<Trans message="This album has no tracks yet." />);
    }
    return tracks;
  }
  return (album as FullAlbum).tracks || [];
}
