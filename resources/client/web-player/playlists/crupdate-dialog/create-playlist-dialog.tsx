import {CrupdatePlaylistFields} from '@app/web-player/playlists/crupdate-dialog/crupdate-playlist-fields';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {
  CreatePlaylistPayload,
  useCreatePlaylist,
} from '@app/web-player/playlists/requests/use-create-playlist';
import {useControlledState} from '@react-stately/utils';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useForm} from 'react-hook-form';

// todo: test on mobile and from context menu with track loading and creting new playlist

type CreatePlaylistDialogProps = {
  children?: Dialog.TriggerElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreate?: (playlist: PartialPlaylist) => void;
};

export function CreatePlaylistDialog({
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onCreate,
}: CreatePlaylistDialogProps) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DialogContent
          onCreate={playlist => {
            onCreate?.(playlist);
            setOpen(false);
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogContent({
  onCreate,
}: {
  onCreate: (playlist: PartialPlaylist) => void;
}) {
  const form = useForm<CreatePlaylistPayload>({
    defaultValues: {
      name: '',
      public: false,
      collaborative: false,
      image: null,
      description: '',
    },
  });
  const createPlaylist = useCreatePlaylist(form);

  return (
    <HookForm.Root
      form={form}
      onSubmit={values => {
        createPlaylist.mutate(values, {
          onSuccess: response => {
            onCreate(response.playlist);
          },
        });
      }}
    >
      <Dialog.Content className="sm:max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="New playlist" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <CrupdatePlaylistFields />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={createPlaylist.isPending}>
            <Trans message="Create" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
