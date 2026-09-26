import {useDeleteComments} from '@common/comments/requests/use-delete-comments';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Button, ButtonSize, ButtonVariant} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {MessageCircleIcon} from 'lucide-react';
import {useState} from 'react';

interface DeleteCommentsButtonProps {
  commentIds: number[];
  variant?: ButtonVariant;
  size?: ButtonSize;
  onDelete: () => void;
}
export function DeleteCommentsButton({
  commentIds,
  variant = 'outline',
  size,
  onDelete,
}: DeleteCommentsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteComments = useDeleteComments();

  const handleDelete = () => {
    deleteComments.mutate(
      {commentIds},
      {
        onSuccess: () => {
          onDelete();
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialog.Trigger
        render={
          <Button
            variant={variant}
            color="danger"
            size={size}
            disabled={deleteComments.isPending}
          />
        }
      >
        <Trans message="Delete" />
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Content size="sm">
          <AlertDialog.Header>
            <AlertDialog.Media>
              <MessageCircleIcon />
            </AlertDialog.Media>
            <AlertDialog.Title>
              <Trans
                message="Delete [one comment|other :count comments]"
                values={{count: commentIds.length}}
              />
            </AlertDialog.Title>
            <AlertDialog.Description>
              {commentIds.length > 1 ? (
                <Trans message="Are you sure you want to delete selected comments?" />
              ) : (
                <Trans message="Are you sure you want to delete this comment?" />
              )}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={deleteComments.isPending}>
              <Trans message="Cancel" />
            </AlertDialog.Cancel>
            <AlertDialog.Action
              color="danger"
              disabled={deleteComments.isPending}
              onClick={() => handleDelete()}
            >
              <Trans message="Delete" />
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
