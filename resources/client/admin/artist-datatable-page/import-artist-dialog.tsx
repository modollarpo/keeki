import {
  ImportArtistPayload,
  useImportArtist,
} from '@app/admin/artist-datatable-page/requests/use-import-artist';
import {PartialArtist} from '@app/web-player/artists/artist';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Select} from '@shadcn/forms/select/select';
import {Switch} from '@shadcn/forms/switch/switch';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {ReactElement, useMemo, useState} from 'react';
import {useForm, useWatch} from 'react-hook-form';

type ImportArtistDialogProps = {
  children: ReactElement<typeof Dialog.Trigger>;
  onImported?: (artist: PartialArtist) => void;
};

export function ImportArtistDialog({
  children,
  onImported,
}: ImportArtistDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <ImportArtistDialogContent
          onClose={() => setOpen(false)}
          onImported={artist => {
            setOpen(false);
            onImported?.(artist);
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ImportArtistDialogContent({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported?: (artist: PartialArtist) => void;
}) {
  const settings = useSettings();
  const {spotify_is_setup} = settings;
  const defaultMetadataProvider =
    settings.metadata_provider === 'spotify' && !!spotify_is_setup
      ? 'spotify'
      : 'deezer';

  const form = useForm<ImportArtistPayload>({
    defaultValues: {
      metadataProvider: defaultMetadataProvider,
      importAlbums: true,
      importSimilarArtists: true,
    },
  });

  const selectedMetadataProvider = useWatch({
    control: form.control,
    name: 'metadataProvider',
  });
  const importArtist = useImportArtist();

  const handleSubmit = (values: ImportArtistPayload) => {
    importArtist.mutate(values, {
      onSuccess: response => {
        onImported?.(response.artist);
      },
      onError: err => onFormQueryError(err, form),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Import artist" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Field.Group>
            <ImportMetadataProviderFields />

            <HookForm.Field name="importAlbums">
              <Field.Label>
                <Trans message="Import albums" />
                <Switch />
              </Field.Label>
              <Field.Error />
            </HookForm.Field>

            {(settings.spotify_use_deprecated_api ||
              selectedMetadataProvider !== 'spotify') && (
              <HookForm.Field name="importSimilarArtists">
                <Field.Label>
                  <Trans message="Import similar artists" />
                  <Switch />
                </Field.Label>
                <Field.Error />
              </HookForm.Field>
            )}
          </Field.Group>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton onClick={onClose}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={importArtist.isPending}>
            <Trans message="Import" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}

export function ImportMetadataProviderFields() {
  const {spotify_is_setup} = useSettings();
  const selectedMetadataProvider = useWatch({
    name: 'metadataProvider',
  });

  const providerItems = useMemo(() => {
    const items: {value: 'deezer' | 'spotify'; label: ReactElement}[] = [
      {value: 'deezer', label: <Trans message="Deezer" />},
    ];
    if (spotify_is_setup) {
      items.unshift({
        value: 'spotify',
        label: <Trans message="Spotify" />,
      });
    }
    return items;
  }, [spotify_is_setup]);

  return (
    <Field.Group>
      <HookForm.Field name="metadataProvider">
        <Field.Label>
          <Trans message="Provider" />
        </Field.Label>
        <Select.Root items={providerItems}>
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {providerItems.map(item => (
              <Select.Item key={item.value} value={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.Error />
      </HookForm.Field>

      {selectedMetadataProvider === 'spotify' && (
        <HookForm.Field name="spotifyId">
          <Field.Label>
            <Trans message="Spotify ID" />
          </Field.Label>
          <Input required autoFocus minLength={22} maxLength={22} />
          <Field.Error />
        </HookForm.Field>
      )}

      {selectedMetadataProvider === 'deezer' && (
        <HookForm.Field name="deezerId">
          <Field.Label>
            <Trans message="Deezer ID" />
          </Field.Label>
          <Input required autoFocus type="number" />
          <Field.Error />
        </HookForm.Field>
      )}
    </Field.Group>
  );
}
