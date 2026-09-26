import {User} from '@app/gen/schemas/user';
import {useAuth} from '@common/auth/use-auth';
import {UserAvatar} from '@common/auth/user-avatar';
import {Comment} from '@common/comments/comment';
import {Commentable} from '@common/comments/commentable';
import {NewCommentForm} from '@common/comments/new-comment-form';
import {useDeleteComments} from '@common/comments/requests/use-delete-comments';
import {SiteConfigContext} from '@common/core/settings/site-config-context';
import {useSubmitReport} from '@common/reports/requests/use-submit-report';
import {ThumbButtons} from '@common/votes/thumb-buttons';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Avatar} from '@ui/avatar/avatar';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {FormattedRelativeTime} from '@ui/i18n/formatted-relative-time';
import {Trans} from '@ui/i18n/trans';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {
  FlagIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  ReplyIcon,
  TrashIcon,
} from 'lucide-react';
import {memo, useContext, useState} from 'react';
import {Link} from 'react-router';

interface CommentListItemProps {
  comment: Comment;
  commentable: Commentable;
  canDelete?: boolean;
}
export function CommentListItem({
  comment,
  commentable,
  // user can delete comment if they have created it, or they have relevant permissions on commentable
  canDelete,
}: CommentListItemProps) {
  const isMobile = useIsMobileMediaQuery();
  const {user, hasPermission} = useAuth();
  const [replyFormVisible, setReplyFormVisible] = useState(false);
  const showReplyButton =
    user != null &&
    !comment.deleted &&
    comment.depth < 5 &&
    hasPermission('comments.create');

  return (
    <div style={{paddingLeft: `${comment.depth * 20}px`}}>
      <div className="group flex min-h-17.5 items-start gap-6 py-4.5">
        {comment.user ? (
          <UserAvatar
            user={comment.user}
            size={isMobile ? 'lg' : 'xl'}
            circle
          />
        ) : (
          <Avatar label="User" />
        )}
        <div className="flex-auto text-sm">
          <div className="mb-1 flex items-center gap-2">
            {comment.user && <UserDisplayName user={comment.user} />}
            <time className="text-xs text-muted-foreground">
              <FormattedRelativeTime date={comment.created_at} />
            </time>
            {comment.position ? (
              <Position commentable={commentable} position={comment.position} />
            ) : null}
          </div>
          <div className="whitespace-pre-line">
            {comment.deleted ? (
              <span className="text-muted-foreground italic">
                <Trans message="[COMMENT DELETED]" />
              </span>
            ) : (
              comment.content
            )}
          </div>
          {!comment.deleted && (
            <div className="mt-2.5 -ml-2 flex items-center gap-2">
              {showReplyButton && (
                <div className="contents">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="max-md:hidden"
                    onClick={() => setReplyFormVisible(!replyFormVisible)}
                  >
                    <ReplyIcon />
                    <Trans message="Reply" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    onClick={() => setReplyFormVisible(!replyFormVisible)}
                  >
                    <ReplyIcon />
                  </Button>
                </div>
              )}
              <ThumbButtons model={comment} showUpvotesOnly />
              <CommentOptionsTrigger
                comment={comment}
                canDelete={canDelete}
                user={user}
              />
            </div>
          )}
        </div>
      </div>
      {replyFormVisible ? (
        <NewCommentForm
          className={!comment?.depth ? 'pl-5' : undefined}
          commentable={commentable}
          inReplyTo={comment}
          autoFocus
          onSuccess={() => {
            setReplyFormVisible(false);
          }}
        />
      ) : null}
    </div>
  );
}

interface PositionProps {
  commentable: Commentable;
  position: number;
}
const Position = memo(({commentable, position}: PositionProps) => {
  if (!commentable.duration) return null;
  const seconds = (position / 100) * (commentable.duration / 1000);
  return (
    <span className="text-xs text-muted-foreground">
      <Trans
        message="at :position"
        values={{
          position: <FormattedDuration seconds={seconds} />,
        }}
      />
    </span>
  );
});

interface DeleteCommentsButtonProps {
  comment: Comment;
  canDelete?: boolean;
  user: User | null;
}
export function CommentOptionsTrigger({
  comment,
  canDelete,
  user,
}: DeleteCommentsButtonProps) {
  const deleteComments = useDeleteComments();
  const reportComment = useSubmitReport(comment);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const showDeleteButton =
    (comment.user_id === user?.id || canDelete) && !comment.deleted;

  const handleReport = () => {
    reportComment.mutate({});
  };

  const handleDelete = () => {
    deleteComments.mutate(
      {commentIds: [comment.id]},
      {
        onSuccess: () => setIsDeleteDialogOpen(false),
      },
    );
  };

  return (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger render={<Button variant="ghost" size="sm" />}>
          <MoreVerticalIcon />
          <Trans message="More" />
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item onClick={() => handleReport()}>
            <FlagIcon />
            <Trans message="Report comment" />
          </Dropdown.Item>
          {showDeleteButton && (
            <Dropdown.Item
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <TrashIcon />
              <Trans message="Delete" />
            </Dropdown.Item>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
      <AlertDialog.Root
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Content size="sm">
            <AlertDialog.Header>
              <AlertDialog.Media>
                <MessageCircleIcon />
              </AlertDialog.Media>
              <AlertDialog.Title>
                <Trans message="Delete comment?" />
              </AlertDialog.Title>
              <AlertDialog.Description>
                <Trans message="Are you sure you want to delete this comment?" />
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
    </>
  );
}

interface UserDisplayNameProps {
  user: {
    name: string;
    id: number;
  };
}
function UserDisplayName({user}: UserDisplayNameProps) {
  const {auth} = useContext(SiteConfigContext);
  if (auth?.getUserProfileLink) {
    return (
      <Link
        to={auth.getUserProfileLink(user)}
        className="text-base font-medium hover:underline"
      >
        {user.name}
      </Link>
    );
  }
  return <div className="text-base font-medium">{user.name}</div>;
}
