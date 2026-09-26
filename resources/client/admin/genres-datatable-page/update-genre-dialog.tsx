import {CrupdateGenreForm} from '@app/admin/genres-datatable-page/crupdate-genre-form';
import {useImportGenreContent} from '@app/admin/genres-datatable-page/requests/use-import-genre-content';
import {
  UpdateGenrePayload,
  useUpdateGenre,
} from '@app/admin/genres-datatable-page/requests/use-update-genre';
import {Genre} from '@app/web-player/genres/genre';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {useState} from 'react';
import {useForm} from 'react-hook-form';

type UpdateGenreDialogProps = {
  genre: Genre;
  children: Dialog.TriggerElement;
};

export function UpdateGenreDialog({genre, children}: UpdateGenreDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <UpdateGenreDialogContent
          genre={genre}
          onClose={() => setOpen(false)}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function UpdateGenreDialogContent({
  genre,
  onClose,
}: {
  genre: Genre;
  onClose: () => void;
}) {
  const {spotify_is_setup, spotify_use_deprecated_api, metadata_provider} =
    useSettings();
  const form = useForm<UpdateGenrePayload>({
    defaultValues: {
      id: genre.id,
      name: genre.name,
      display_name: genre.display_name,
      image: genre.image ?? '',
    },
  });
  const updateGenre = useUpdateGenre(form);
  const importArtists = useImportGenreContent();

  let canImportGenreData = false;
  if (metadata_provider === 'spotify') {
    canImportGenreData = !!spotify_is_setup && !!spotify_use_deprecated_api;
  } else if (metadata_provider === 'deezer') {
    canImportGenreData = true;
  }

  const handleSubmit = (values: UpdateGenrePayload) => {
    updateGenre.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans
              message="Update “:name“ genre"
              values={{name: genre.name}}
            />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <CrupdateGenreForm />
        </Dialog.Body>
        <Dialog.Footer>
          {canImportGenreData ? (
            <Button
              variant="outline"
              className="mr-auto"
              disabled={importArtists.isPending || updateGenre.isPending}
              onClick={() =>
                importArtists.mutate({genre}, {onSuccess: () => onClose()})
              }
            >
              <Trans message="Import content" />
            </Button>
          ) : null}
          <Dialog.CloseButton
            disabled={updateGenre.isPending || importArtists.isPending}
          >
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button
            type="submit"
            disabled={updateGenre.isPending || importArtists.isPending}
          >
            <Trans message="Save" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
