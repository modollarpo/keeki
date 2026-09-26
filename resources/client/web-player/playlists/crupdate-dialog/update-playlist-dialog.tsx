import {CrupdatePlaylistFields} from '@app/web-player/playlists/crupdate-dialog/crupdate-playlist-fields';
import {FullPlaylist, PartialPlaylist} from '@app/web-player/playlists/playlist';
import {CreatePlaylistPayload} from '@app/web-player/playlists/requests/use-create-playlist';
import {useUpdatePlaylist} from '@app/web-player/playlists/requests/use-update-playlist';
import {useControlledState} from '@react-stately/utils';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useForm} from 'react-hook-form';

type UpdatePlaylistDialogProps = {
  playlist: FullPlaylist | PartialPlaylist;
  children?: Dialog.TriggerElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUpdate?: (playlist: PartialPlaylist) => void;
};

export function UpdatePlaylistDialog({
  playlist,
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onUpdate,
}: UpdatePlaylistDialogProps) {
  const [open, setOpen] = useControlledState(
    openProp,
    false,
    onOpenChangeProp,
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DialogContent
          playlist={playlist}
          onUpdate={updatedPlaylist => {
            onUpdate?.(updatedPlaylist);
            setOpen(false);
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogContent({
  playlist,
  onUpdate,
}: {
  playlist: FullPlaylist | PartialPlaylist;
  onUpdate: (playlist: PartialPlaylist) => void;
}) {
  const form = useForm<CreatePlaylistPayload>({
    defaultValues: {
      name: playlist.name,
      public: playlist.public,
      collaborative: playlist.collaborative,
      image: playlist.image,
      description:
        'description' in playlist ? (playlist.description ?? '') : '',
    },
  });
  const updatePlaylist = useUpdatePlaylist({form, playlistId: playlist.id});

  return (
    <HookForm.Root
      form={form}
      onSubmit={values => {
        updatePlaylist.mutate(values, {
          onSuccess: response => {
            onUpdate(response.playlist);
          },
        });
      }}
    >
      <Dialog.Content className="sm:max-w-xl">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Update playlist" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <CrupdatePlaylistFields />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={updatePlaylist.isPending}>
            <Trans message="Update" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
