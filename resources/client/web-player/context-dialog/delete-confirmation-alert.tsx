import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Trans} from '@ui/i18n/trans';
import {ReactNode} from 'react';

interface DeleteConfirmationAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  icon: ReactNode;
  isPending?: boolean;
  onConfirm: () => void;
}
export function DeleteConfirmationAlert({
  open,
  onOpenChange,
  title,
  description,
  icon,
  isPending,
  onConfirm,
}: DeleteConfirmationAlertProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Content size="sm">
          <AlertDialog.Header>
            <AlertDialog.Media>{icon}</AlertDialog.Media>
            <AlertDialog.Title>{title}</AlertDialog.Title>
            <AlertDialog.Description>{description}</AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={isPending}>
              <Trans message="Cancel" />
            </AlertDialog.Cancel>
            <AlertDialog.Action
              color="danger"
              disabled={isPending}
              onClick={onConfirm}
            >
              <Trans message="Delete" />
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
