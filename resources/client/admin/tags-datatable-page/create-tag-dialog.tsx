import {CrupdateTagForm} from '@app/admin/tags-datatable-page/crupdate-tag-form';
import {
  CreateTagPayload,
  useCreateTag,
} from '@app/admin/tags-datatable-page/requests/use-create-tag';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';
import {useForm} from 'react-hook-form';

type CreateTagDialogProps = {
  children: Dialog.TriggerElement;
};

export function CreateTagDialog({children}: CreateTagDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <CreateTagDialogContent onClose={() => setOpen(false)} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CreateTagDialogContent({onClose}: {onClose: () => void}) {
  const form = useForm<CreateTagPayload>({
    defaultValues: {
      name: '',
      display_name: '',
    },
  });
  const createTag = useCreateTag(form);

  const handleSubmit = (values: CreateTagPayload) => {
    createTag.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Create new tag" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <CrupdateTagForm />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton disabled={createTag.isPending}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={createTag.isPending}>
            <Trans message="Create" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
