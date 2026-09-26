import {CrupdateLyricForm} from '@app/admin/lyrics-datatable-page/crupdate-lyric-form';
import {
  CreateLyricPayload,
  useCreateLyric,
} from '@app/admin/lyrics-datatable-page/requests/use-create-lyric';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';
import {useForm} from 'react-hook-form';

type CreateLyricDialogProps = {
  trackId?: number;
  children: Dialog.TriggerElement;
};

export function CreateLyricDialog({
  trackId,
  children,
}: CreateLyricDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <CreateLyricDialogContent
          trackId={trackId}
          onClose={() => setOpen(false)}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CreateLyricDialogContent({
  trackId,
  onClose,
}: {
  trackId?: number;
  onClose: () => void;
}) {
  const form = useForm<CreateLyricPayload>({
    defaultValues: {
      track_id: trackId,
      is_synced: false,
    },
  });
  const createLyric = useCreateLyric(form);

  const handleSubmit = (values: CreateLyricPayload) => {
    createLyric.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content className="sm:max-w-3xl">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Create new lyric" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <CrupdateLyricForm />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton disabled={createLyric.isPending}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={createLyric.isPending}>
            <Trans message="Create" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
