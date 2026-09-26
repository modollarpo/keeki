import {useCreateTrackForm} from '@app/admin/tracks-datatable-page/crupdate/use-create-track-form';
import {CreateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {TrackForm} from '@app/admin/tracks-datatable-page/track-form/track-form';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';

type CreateTrackDialogProps = {
  children: Dialog.TriggerElement;
  defaultValues?: Partial<CreateTrackPayload>;
  hideAlbumField?: boolean;
  onCreate?: (track: CreateTrackPayload) => void;
};

export function CreateTrackDialog({
  children,
  defaultValues,
  hideAlbumField,
  onCreate,
}: CreateTrackDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        {open && (
          <CreateTrackDialogContent
            defaultValues={defaultValues}
            hideAlbumField={hideAlbumField}
            onCreate={values => {
              onCreate?.(values);
              setOpen(false);
            }}
          />
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CreateTrackDialogContent({
  defaultValues,
  hideAlbumField,
  onCreate,
}: Omit<CreateTrackDialogProps, 'children'>) {
  const {form} = useCreateTrackForm({defaultValues});

  return (
    <HookForm.Root form={form} onSubmit={values => onCreate?.(values)}>
      <Dialog.Content className="sm:max-w-5xl">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Add new track" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <TrackForm showExternalIdFields showAlbumField={!hideAlbumField} />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit">
            <Trans message="Create" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
