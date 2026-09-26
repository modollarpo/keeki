import {CrupdateLyricForm} from '@app/admin/lyrics-datatable-page/crupdate-lyric-form';
import {
  UpdateLyricPayload,
  useUpdateLyric,
} from '@app/admin/lyrics-datatable-page/requests/use-update-lyric';
import {Lyric} from '@app/web-player/tracks/lyrics/lyric';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';
import {useForm} from 'react-hook-form';

type UpdateLyricDialogProps = {
  lyric: Lyric;
  children: Dialog.TriggerElement;
};

export function UpdateLyricDialog({lyric, children}: UpdateLyricDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <UpdateLyricDialogContent
          lyric={lyric}
          onClose={() => setOpen(false)}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function UpdateLyricDialogContent({
  lyric,
  onClose,
}: {
  lyric: Lyric;
  onClose: () => void;
}) {
  const form = useForm<UpdateLyricPayload>({
    defaultValues: {
      id: lyric.id,
      track_id: lyric.track_id,
      text: lyric.text,
      is_synced: lyric.is_synced,
      duration: lyric.duration,
    },
  });
  const updateLyric = useUpdateLyric(form);

  const handleSubmit = (values: UpdateLyricPayload) => {
    updateLyric.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content className="sm:max-w-3xl">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Update lyric" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <CrupdateLyricForm />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton disabled={updateLyric.isPending}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={updateLyric.isPending}>
            <Trans message="Update" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
