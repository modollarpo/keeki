import {Track} from '@app/web-player/tracks/track';
import {CommentBarContext} from '@app/web-player/tracks/waveform/comment-bar-context';
import {useAuth} from '@common/auth/use-auth';
import {Comment} from '@common/comments/comment';
import {useInteractOutside} from '@react-aria/interactions';
import {Popover} from '@shadcn/popover/popover';
import {Avatar} from '@ui/avatar/avatar';
import {useSlider} from '@ui/forms/slider/use-slider';
import clsx from 'clsx';
import {useContext} from 'react';

interface CommentBarProps {
  comments: Comment[];
  track: Track;
}
export function CommentBar({comments, track}: CommentBarProps) {
  const {user, hasPermission} = useAuth();
  const {
    newCommentInputRef,
    newCommentPositionRef,
    markerIsVisible,
    setMarkerIsVisible,
    ...commentBarContext
  } = useContext(CommentBarContext);

  const disableCommenting =
    commentBarContext.disableCommenting || !hasPermission('comments.create');

  const {domProps, groupId, trackRef, getThumbPercent} = useSlider({
    onChange: () => {
      setMarkerIsVisible(true);
      newCommentPositionRef.current = getThumbPercent(0) * 100;
    },
    onChangeEnd: () => {
      newCommentInputRef.current?.focus();
    },
  });

  useInteractOutside({
    ref: trackRef,
    onInteractOutside: e => {
      if (!newCommentInputRef.current?.contains(e.target as HTMLElement)) {
        setMarkerIsVisible(false);
      }
    },
  });

  return (
    <div
      className={clsx(
        'absolute top-12 left-0 isolate h-6.5 w-full',
        !disableCommenting && 'cursor-pointer',
      )}
      ref={trackRef}
      {...(disableCommenting ? {} : domProps)}
      id={groupId}
    >
      {markerIsVisible ? (
        <div
          className="absolute top-0 left-0 z-20 h-6.5 w-6.5 -translate-x-1/2 cursor-move overflow-hidden shadow-md"
          style={{left: `${getThumbPercent(0) * 100}%`}}
        >
          <Avatar
            src={user?.image}
            label={user?.name}
            circle={false}
            size="w-full h-full"
          />
        </div>
      ) : null}
      {comments.map(comment => {
        if (!comment.user) return null;
        return (
          <Popover.Root key={comment.id}>
            <Popover.Trigger
              openOnHover
              nativeButton={false}
              render={
                <div
                  style={{left: `${Math.min(99, comment.position || 0)}%`}}
                  className={clsx(
                    'absolute top-0 -translate-x-1/2 cursor-pointer transition-opacity duration-300 ease-in-out',
                    markerIsVisible ? 'opacity-40' : 'opacity-100',
                  )}
                />
              }
            >
              <div
                className="bg-secondary flex h-4 w-4 items-center justify-center rounded bg-cover shadow-sm"
                style={{backgroundImage: `url(${comment.user.image})`}}
              >
                {!comment.user.image ? (
                  <Avatar
                    label={comment.user.name}
                    circle={false}
                    size="w-full h-full"
                  />
                ) : null}
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="w-auto gap-0 p-2">
                <CommentPopover comment={comment} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        );
      })}
    </div>
  );
}

interface CommentPopoverProps {
  comment: Comment;
}
function CommentPopover({comment}: CommentPopoverProps) {
  return (
    <div className="flex items-center gap-2.5">
      {comment.user && (
        <div className="text-primary">{comment.user.name}</div>
      )}
      <div>{comment.content}</div>
    </div>
  );
}
