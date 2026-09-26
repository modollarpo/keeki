import {commentQueries} from '@common/comments/comment-queries';
import {useRestoreComments} from '@common/comments/requests/use-restore-comments';
import {queryClient} from '@common/http/query-client';
import {Button, ButtonSize, ButtonVariant} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';

interface Props {
  commentIds: number[];
  variant?: ButtonVariant;
  size?: ButtonSize;
}
export function RestoreCommentsButton({
  commentIds,
  variant = 'outline',
  size = 'xs',
}: Props) {
  const restoreComments = useRestoreComments();
  return (
    <Button
      variant={variant}
      size={size}
      disabled={restoreComments.isPending}
      onClick={() => {
        restoreComments.mutate(
          {commentIds},
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: commentQueries.invalidateKey,
              });
            },
          },
        );
      }}
    >
      <Trans message="Restore" />
    </Button>
  );
}
