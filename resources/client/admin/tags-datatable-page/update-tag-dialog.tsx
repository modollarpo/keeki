import {CrupdateTagForm} from '@app/admin/tags-datatable-page/crupdate-tag-form';
import {
  UpdateTagPayload,
  useUpdateTag,
} from '@app/admin/tags-datatable-page/requests/use-update-tag';
import {Tag} from '@app/web-player/tags/tag';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';
import {useForm} from 'react-hook-form';

type UpdateTagDialogProps = {
  tag: Tag;
  children: Dialog.TriggerElement;
};

export function UpdateTagDialog({tag, children}: UpdateTagDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <UpdateTagDialogContent tag={tag} onClose={() => setOpen(false)} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function UpdateTagDialogContent({
  tag,
  onClose,
}: {
  tag: Tag;
  onClose: () => void;
}) {
  const form = useForm<UpdateTagPayload>({
    defaultValues: {
      id: tag.id,
      name: tag.name,
      display_name: tag.display_name ?? '',
    },
  });
  const updateTag = useUpdateTag(form);

  const handleSubmit = (values: UpdateTagPayload) => {
    updateTag.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans
              message="Update “:name“ tag"
              values={{name: tag.display_name || tag.name}}
            />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <CrupdateTagForm />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton disabled={updateTag.isPending}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={updateTag.isPending}>
            <Trans message="Save" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
