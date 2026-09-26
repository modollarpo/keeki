import {ImportMetadataProviderFields} from '@app/admin/artist-datatable-page/import-artist-dialog';
import {
  ImportPlaylistPayload,
  useImportPlaylist,
} from '@app/admin/playlist-datatable-page/requests/use-import-playlist';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {ReactElement, useState} from 'react';
import {useForm} from 'react-hook-form';

type ImportPlaylistDialogProps = {
  children: ReactElement<typeof Dialog.Trigger>;
  onImported?: (playlist: PartialPlaylist) => void;
};

export function ImportPlaylistDialog({
  children,
  onImported,
}: ImportPlaylistDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <ImportPlaylistDialogContent
          onClose={() => setOpen(false)}
          onImported={playlist => {
            setOpen(false);
            onImported?.(playlist);
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ImportPlaylistDialogContent({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported?: (playlist: PartialPlaylist) => void;
}) {
  const settings = useSettings();
  const {spotify_is_setup} = settings;
  const defaultMetadataProvider =
    settings.metadata_provider === 'spotify' && !!spotify_is_setup
      ? 'spotify'
      : 'deezer';

  const form = useForm<ImportPlaylistPayload>({
    defaultValues: {
      metadataProvider: defaultMetadataProvider,
    },
  });

  const importPlaylist = useImportPlaylist();

  const handleSubmit = (values: ImportPlaylistPayload) => {
    importPlaylist.mutate(values, {
      onSuccess: response => {
        onImported?.(response.playlist);
      },
      onError: err => onFormQueryError(err, form),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Import playlist" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Field.Group>
            <ImportMetadataProviderFields />
          </Field.Group>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton onClick={onClose}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={importPlaylist.isPending}>
            <Trans message="Import" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
