import {
  ImportAlbumPayload,
  useImportAlbum,
} from '@app/admin/albums-datatable-page/requests/use-import-album';
import {ImportMetadataProviderFields} from '@app/admin/artist-datatable-page/import-artist-dialog';
import {PartialAlbum} from '@app/web-player/albums/album';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {ReactElement, useState} from 'react';
import {useForm} from 'react-hook-form';

type ImportAlbumDialogProps = {
  children: ReactElement<typeof Dialog.Trigger>;
  onImported?: (album: PartialAlbum) => void;
};

export function ImportAlbumDialog({
  children,
  onImported,
}: ImportAlbumDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <ImportAlbumDialogContent
          onClose={() => setOpen(false)}
          onImported={album => {
            setOpen(false);
            onImported?.(album);
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ImportAlbumDialogContent({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported?: (album: PartialAlbum) => void;
}) {
  const settings = useSettings();
  const {spotify_is_setup} = settings;
  const defaultMetadataProvider =
    settings.metadata_provider === 'spotify' && !!spotify_is_setup
      ? 'spotify'
      : 'deezer';

  const form = useForm<ImportAlbumPayload>({
    defaultValues: {
      metadataProvider: defaultMetadataProvider,
    },
  });

  const importAlbum = useImportAlbum();

  const handleSubmit = (values: ImportAlbumPayload) => {
    importAlbum.mutate(values, {
      onSuccess: response => {
        onImported?.(response.album);
      },
      onError: err => onFormQueryError(err, form),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Import album" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Field.Group>
            <ImportMetadataProviderFields />
            <p className="text-muted-foreground text-xs">
              <Trans message="This will also import all artists that collaborated on this album and any tracks that it contains." />
            </p>
          </Field.Group>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton onClick={onClose}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={importAlbum.isPending}>
            <Trans message="Import" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
