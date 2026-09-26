import {CrupdateGenreForm} from '@app/admin/genres-datatable-page/crupdate-genre-form';
import {
  CreateGenrePayload,
  useCreateGenre,
} from '@app/admin/genres-datatable-page/requests/use-create-genre';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';
import {useForm} from 'react-hook-form';

type CreateGenreDialogProps = {
  children: Dialog.TriggerElement;
};

export function CreateGenreDialog({children}: CreateGenreDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <CreateGenreDialogContent onClose={() => setOpen(false)} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CreateGenreDialogContent({onClose}: {onClose: () => void}) {
  const form = useForm<CreateGenrePayload>({
    defaultValues: {
      name: '',
      display_name: '',
      image: '',
    },
  });
  const createGenre = useCreateGenre(form);

  const handleSubmit = (values: CreateGenrePayload) => {
    createGenre.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Create new genre" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <CrupdateGenreForm />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton disabled={createGenre.isPending}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={createGenre.isPending}>
            <Trans message="Create" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
