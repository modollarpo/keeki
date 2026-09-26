import {PartialArtist} from '@app/web-player/artists/artist';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink, getArtistLink} from '@app/web-player/artists/artist-link';
import {useDeleteArtist} from '@app/web-player/artists/requests/use-delete-artist';
import {useArtistPermissions} from '@app/web-player/artists/use-artist-permissions';
import {
  ContextDialogLayout,
  ContextMenuButton,
  ContextMenuLayoutProps,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {CopyLinkMenuButton} from '@app/web-player/context-dialog/copy-link-menu-button';
import {DeleteConfirmationAlert} from '@app/web-player/context-dialog/delete-confirmation-alert';
import {ShareMediaButton} from '@app/web-player/context-dialog/share-media-button';
import {ToggleInLibraryMenuButton} from '@app/web-player/context-dialog/toggle-in-library-menu-button';
import {getRadioLink} from '@app/web-player/radio/get-radio-link';
import {useShouldShowRadioButton} from '@app/web-player/tracks/context-dialog/use-should-show-radio-button';
import {Track} from '@app/web-player/tracks/track';
import {Trans} from '@ui/i18n/trans';
import {
  ChartNoAxesColumnIcon,
  MicVocalIcon,
  PencilIcon,
  RadioIcon,
  Trash2Icon,
} from 'lucide-react';
import {useCallback, useState} from 'react';

interface ArtistContextDialogProps {
  artist: PartialArtist;
  type: ContextMenuLayoutProps['type'];
}
export function ArtistContextDialog({artist, type}: ArtistContextDialogProps) {
  const showRadioButton = useShouldShowRadioButton();
  const {canEdit, canDelete} = useArtistPermissions(artist);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const loadTracks = useCallback(() => {
    return loadArtistTracks(artist);
  }, [artist]);

  return (
    <>
      {canDelete && (
        <DeleteArtistAlert
          artist={artist}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
      <ContextDialogLayout
        image={<SmallArtistImage artist={artist} />}
        title={<ArtistLink artist={artist} />}
        loadTracks={loadTracks}
        type={type}
        item={artist}
      >
        <ToggleInLibraryMenuButton items={[artist]} modelType="artist" />
        {showRadioButton && (
          <ContextMenuButton to={getRadioLink(artist)} startIcon={<RadioIcon />}>
            <Trans message="Go to artist radio" />
          </ContextMenuButton>
        )}
        <CopyLinkMenuButton link={getArtistLink(artist, {absolute: true})}>
          <Trans message="Copy artist link" />
        </CopyLinkMenuButton>
        <ShareMediaButton />
        {canEdit && (
          <ContextMenuButton
            to={`/backstage/artists/${artist.id}/insights`}
            startIcon={<ChartNoAxesColumnIcon />}
          >
            <Trans message="Insights" />
          </ContextMenuButton>
        )}
        {canEdit && (
          <ContextMenuButton
            to={`/backstage/artists/${artist.id}/edit`}
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

function DeleteArtistAlert({
  artist,
  open,
  onOpenChange,
}: {
  artist: PartialArtist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteArtist = useDeleteArtist(artist.id);

  return (
    <DeleteConfirmationAlert
      open={open}
      onOpenChange={onOpenChange}
      icon={<MicVocalIcon />}
      title={<Trans message="Delete artist" />}
      description={
        <Trans message="Are you sure you want to delete this artist?" />
      }
      isPending={deleteArtist.isPending}
      onConfirm={() => {
        deleteArtist.mutate(undefined, {
          onSuccess: () => onOpenChange(false),
        });
      }}
    />
  );
}

// tracks are never used/loaded in artist context dialog
async function loadArtistTracks(_artist: PartialArtist): Promise<Track[]> {
  return Promise.resolve([]);
}
