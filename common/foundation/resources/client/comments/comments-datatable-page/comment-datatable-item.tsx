import {Comment} from '@common/comments/comment';
import {DeleteCommentsButton} from '@common/comments/comments-datatable-page/delete-comments-button';
import {RestoreCommentsButton} from '@common/comments/comments-datatable-page/restore-comments-button';
import {useUpdateComment} from '@common/comments/requests/use-update-comment';
import {SiteConfigContext} from '@common/core/settings/site-config-context';
import {Avatar} from '@shadcn/avatar/avatar';
import {Button, LinkButton} from '@shadcn/button/button';
import {Checkbox} from '@shadcn/forms/checkbox/checkbox';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {Item} from '@shadcn/item/item';
import {FormattedRelativeTime} from '@ui/i18n/formatted-relative-time';
import {Trans} from '@ui/i18n/trans';
import {NormalizedModel} from '@ui/types/normalized-model';
import {cn} from '@ui/utils/cn';
import {Fragment, use, useState} from 'react';

interface Props {
  comment: Comment;
  isSelected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}
export function CommentDatatableItem({
  comment,
  isSelected,
  onToggle,
  onDelete,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <Item.Root
      variant="outline"
      className={cn('items-start', comment.deleted && 'bg-destructive/6')}
    >
      <Item.Header>
        <div className="flex min-w-0 items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle()}
            bindToHookForm={false}
          />
          {comment.commentable ? (
            <CommentableMeta commentable={comment.commentable} />
          ) : null}
        </div>
      </Item.Header>
      <Item.Media>
        <Avatar.Root>
          <Avatar.Image
            src={comment.user?.image ?? undefined}
            alt={comment.user?.name}
          />
          <Avatar.ColorFallback>{comment.user?.name}</Avatar.ColorFallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <CommentHeader comment={comment} />
        {isEditing ? (
          <EditCommentForm
            comment={comment}
            onClose={() => setIsEditing(false)}
          />
        ) : (
          <Fragment>
            <div className="my-2 text-sm whitespace-pre-wrap">
              {comment.content}
            </div>
            <Item.Footer>
              <div className="flex items-center gap-2">
                {comment.deleted ? (
                  <RestoreCommentsButton commentIds={[comment.id]} />
                ) : (
                  <DeleteCommentsButton
                    commentIds={[comment.id]}
                    size="xs"
                    onDelete={onDelete}
                  />
                )}
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Trans message="Edit" />
                </Button>
              </div>
              {comment.reports_count ? (
                <div className="text-destructive text-xs">
                  <Trans
                    message="Reported [one 1 time|other :count times]"
                    values={{count: comment.reports_count}}
                  />
                </div>
              ) : null}
            </Item.Footer>
          </Fragment>
        )}
      </Item.Content>
    </Item.Root>
  );
}

function CommentableMeta({commentable}: {commentable: NormalizedModel}) {
  return (
    <>
      {commentable.image ? (
        <img
          className="size-5 overflow-hidden rounded-sm object-cover"
          src={commentable.image}
          alt=""
        />
      ) : null}
      <div className="truncate text-sm">{commentable.name}</div>
      <div className="text-muted-foreground text-xs">
        ({commentable.model_type})
      </div>
    </>
  );
}

interface CommentHeaderProps {
  comment: Comment;
}
function CommentHeader({comment}: CommentHeaderProps) {
  return (
    <Item.Row className="text-sm">
      {comment.user && <UserDisplayName user={comment.user} show="name" />}
      {comment.created_at ? (
        <>
          <span className="text-muted-foreground">&bull;</span>
          <time>
            <FormattedRelativeTime date={comment.created_at} />
          </time>
        </>
      ) : null}
      {comment.user ? (
        <div className="ml-auto hidden md:block">
          <UserDisplayName user={comment.user} show="email" />
        </div>
      ) : null}
    </Item.Row>
  );
}

interface EditCommentFormProps {
  comment: Comment;
  onClose: () => void;
}
function EditCommentForm({comment, onClose}: EditCommentFormProps) {
  const [content, setContent] = useState(comment.content);
  const updateComment = useUpdateComment();
  return (
    <form
      className="my-2"
      onSubmit={e => {
        e.preventDefault();
        updateComment.mutate(
          {commentId: comment.id, content},
          {onSuccess: () => onClose()},
        );
      }}
    >
      <Textarea
        autoFocus
        className="mb-2"
        rows={2}
        value={content}
        onChange={e => setContent(e.target.value)}
        bindToHookForm={false}
      />
      <div className="flex items-center gap-2">
        <Button
          size="xs"
          variant="outline"
          color="primary"
          type="submit"
          disabled={updateComment.isPending}
        >
          <Trans message="Save edit" />
        </Button>
        <Button
          size="xs"
          variant="outline"
          type="button"
          onClick={() => onClose()}
          disabled={updateComment.isPending}
        >
          <Trans message="Cancel" />
        </Button>
      </div>
    </form>
  );
}

interface UserDisplayNameProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
  show: 'name' | 'email';
}
function UserDisplayName({user, show}: UserDisplayNameProps) {
  const {auth} = use(SiteConfigContext);
  const value = user[show];
  if (!value) {
    return null;
  }
  if (auth?.getUserProfileLink) {
    return (
      <LinkButton
        size="xs"
        variant="link"
        className="text-primary h-auto px-0"
        to={auth.getUserProfileLink(user)}
        target="_blank"
      >
        {value}
      </LinkButton>
    );
  }
  return <div className="text-muted-foreground">{value}</div>;
}
