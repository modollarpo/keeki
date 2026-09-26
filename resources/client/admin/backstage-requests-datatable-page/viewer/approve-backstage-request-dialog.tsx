import {
  ApproveBackstageRequestPayload,
  useApproveBackstageRequest,
} from '@app/admin/backstage-requests-datatable-page/requests/use-approve-backstage-request';
import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Switch} from '@shadcn/forms/switch/switch';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {useState} from 'react';
import {useForm} from 'react-hook-form';

type Props = {
  request: BackstageRequest;
  children: Dialog.TriggerElement;
};

export function ApproveBackstageRequestDialog({request, children}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DialogContent request={request} onClose={() => setOpen(false)} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogContent({
  request,
  onClose,
}: {
  request: BackstageRequest;
  onClose: () => void;
}) {
  const {trans} = useTrans();
  const form = useForm<Omit<ApproveBackstageRequestPayload, 'requestId'>>();
  const approveRequest = useApproveBackstageRequest();

  const handleSubmit = (
    values: Omit<ApproveBackstageRequestPayload, 'requestId'>,
  ) => {
    approveRequest.mutate(
      {
        ...values,
        requestId: request.id,
      },
      {
        onSuccess: () => onClose(),
        onError: err => onFormQueryError(err, form),
      },
    );
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content className="sm:max-w-lg">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Approve request" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <div className="mb-3.5">
            <Trans message="Are you sure you want to approve this request?" />
          </div>
          <div className="mb-6 font-semibold">
            <Trans
              message="This will create a new artist profile and assign it to ':user', as well as give them artist role on the site."
              values={{user: request.user.name}}
            />
          </div>
          <Field.Group>
            <HookForm.Field name="markArtistAsVerified" orientation="horizontal">
              <Switch />
              <Field.Label>
                <Trans message="Also mark this artist as verified" />
              </Field.Label>
              <Field.Error />
            </HookForm.Field>
            <HookForm.Field name="notes" className="gap-1">
              <Field.Label>
                <Trans message="Notes (optional)" />
              </Field.Label>
              <Textarea
                rows={6}
                placeholder={trans(
                  message(
                    'Add any extra notes that should be sent to use via notification email',
                  ),
                )}
              />
              <Field.Error />
            </HookForm.Field>
          </Field.Group>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton disabled={approveRequest.isPending}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button
            type="submit"
            color="primary"
            disabled={approveRequest.isPending}
          >
            <Trans message="Approve" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}
