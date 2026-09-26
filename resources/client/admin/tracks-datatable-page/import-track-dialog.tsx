import {ImportMetadataProviderFields} from '@app/admin/artist-datatable-page/import-artist-dialog';
import {
  ImportTrackPayload,
  useImportTrack,
} from '@app/admin/tracks-datatable-page/requests/use-import-track';
import {Track} from '@app/web-player/tracks/track';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Switch} from '@shadcn/forms/switch/switch';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {ReactElement, useState} from 'react';
import {useForm} from 'react-hook-form';

type ImportTrackDialogProps = {
  children: ReactElement<typeof Dialog.Trigger>;
  onImported?: (track: Track) => void;
};

export function ImportTrackDialog({
  children,
  onImported,
}: ImportTrackDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <ImportTrackDialogContent
          onClose={() => setOpen(false)}
          onImported={track => {
            setOpen(false);
            onImported?.(track);
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ImportTrackDialogContent({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported?: (track: Track) => void;
}) {
  const settings = useSettings();
  const {spotify_is_setup} = settings;
  const defaultMetadataProvider =
    settings.metadata_provider === 'spotify' && !!spotify_is_setup
      ? 'spotify'
      : 'deezer';

  const form = useForm<ImportTrackPayload>({
    defaultValues: {
      metadataProvider: defaultMetadataProvider,
      importLyrics: true,
    },
  });

  const importTrack = useImportTrack();

  const handleSubmit = (values: ImportTrackPayload) => {
    importTrack.mutate(values, {
      onSuccess: response => {
        onImported?.(response.track);
      },
      onError: err => onFormQueryError(err, form),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Import track" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Field.Group>
            <ImportMetadataProviderFields />
            <HookForm.Field name="importLyrics">
              <Field.Label>
                <Trans message="Import lyrics" />
                <Switch />
              </Field.Label>
              <Field.Error />
            </HookForm.Field>
            <p className="text-muted-foreground text-xs">
              <Trans message="This will also import all artists that collaborated on this track and album this track belongs to." />
            </p>
          </Field.Group>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton onClick={onClose}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={importTrack.isPending}>
            <Trans message="Import" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
