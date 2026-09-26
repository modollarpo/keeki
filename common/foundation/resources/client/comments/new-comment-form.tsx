import {useAuth} from '@common/auth/use-auth';
import {Comment} from '@common/comments/comment';
import {Commentable} from '@common/comments/commentable';
import {useCreateComment} from '@common/comments/requests/use-create-comment';
import {useObjectRef} from '@react-aria/utils';
import {Avatar} from '@shadcn/avatar/avatar';
import {Button} from '@shadcn/button/button';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {cn} from '@ui/utils/cn';
import {RefObject, useState} from 'react';

export interface NewCommentFormProps {
  commentable: Commentable;
  inReplyTo?: Comment;
  onSuccess?: () => void;
  className?: string;
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  // additional data that should be sent to backend when creating comments
  payload?: Record<string, number | string>;
}
export function NewCommentForm({
  commentable,
  inReplyTo,
  onSuccess,
  className,
  autoFocus,
  payload,
  ...props
}: NewCommentFormProps) {
  const {trans} = useTrans();
  const {user} = useAuth();
  const createComment = useCreateComment();
  const inputRef = useObjectRef<HTMLTextAreaElement>(props.inputRef);
  const [inputIsExpanded, setInputIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const clearInput = () => {
    setInputIsExpanded(false);
    if (inputRef.current) {
      inputRef.current.blur();
      setInputValue('');
    }
  };

  return (
    <form
      className={cn('flex gap-6 py-1.5', className)}
      onSubmit={e => {
        e.preventDefault();
        if (inputValue && !createComment.isPending) {
          createComment.mutate(
            {
              ...payload,
              commentable,
              content: inputValue,
              inReplyTo,
            },
            {
              onSuccess: () => {
                clearInput();
                onSuccess?.();
              },
            },
          );
        }
      }}
    >
      <Avatar.Root className="size-15 max-md:size-10">
        <Avatar.Image src={user?.image} alt={user?.name ?? ''} />
        <Avatar.ColorFallback>{user?.name}</Avatar.ColorFallback>
      </Avatar.Root>
      <div className="flex-auto">
        <div className="text-muted-foreground mb-2.5 text-xs">
          <Trans
            message="Comment as :name"
            values={{
              name: <span className="text font-medium">{user?.name}</span>,
            }}
          />
        </div>
        <Textarea
          ref={inputRef}
          autoFocus={autoFocus}
          bindToHookForm={false}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={() => setInputIsExpanded(true)}
          onBlur={() => {
            if (!inputValue) {
              setInputIsExpanded(false);
            }
          }}
          minLength={3}
          rows={inputIsExpanded ? 3 : 1}
          className={cn(!inputIsExpanded && 'min-h-9 py-2')}
          placeholder={
            inReplyTo
              ? trans(message('Write a reply'))
              : trans(message('Leave a comment'))
          }
        />
        {inputIsExpanded && (
          <div className="mt-3 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => clearInput()}
            >
              <Trans message="Cancel" />
            </Button>
            <Button
              variant="outline"
              color="primary"
              type="submit"
              disabled={createComment.isPending || inputValue.length < 3}
            >
              <Trans message="Comment" />
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
