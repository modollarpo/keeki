import {useUpdateTrackForm} from '@app/admin/tracks-datatable-page/crupdate/use-update-track-form';
import {CreateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {UpdateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-update-track';
import {TrackForm} from '@app/admin/tracks-datatable-page/track-form/track-form';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';

type UpdateTrackDialogProps = {
  children: Dialog.TriggerElement;
  track: UpdateTrackPayload | CreateTrackPayload;
  hideAlbumField?: boolean;
  onUpdate?: (track: UpdateTrackPayload) => void;
};

export function UpdateTrackDialog({
  children,
  track,
  hideAlbumField,
  onUpdate,
}: UpdateTrackDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        {open && (
          <UpdateTrackDialogContent
            track={track}
            hideAlbumField={hideAlbumField}
            onUpdate={values => {
              onUpdate?.(values);
              setOpen(false);
            }}
          />
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function UpdateTrackDialogContent({
  track,
  hideAlbumField,
  onUpdate,
}: Omit<UpdateTrackDialogProps, 'children'>) {
  const {form} = useUpdateTrackForm(track);

  return (
    <HookForm.Root form={form} onSubmit={values => onUpdate?.(values)}>
      <Dialog.Content className="sm:max-w-5xl">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Edit “:name“ track" values={{name: track.name}} />
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
            <Trans message="Update" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
