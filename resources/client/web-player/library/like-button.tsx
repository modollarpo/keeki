import {Likeable} from '@app/web-player/library/likeable';
import {useAddItemsToLibrary} from '@app/web-player/library/requests/use-add-items-to-library';
import {useRemoveItemsFromLibrary} from '@app/web-player/library/requests/use-remove-items-from-library';
import {useLibraryStore} from '@app/web-player/library/state/likes-store';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {Button} from '@shadcn/button/button';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {HeartIcon} from 'lucide-react';
import {ComponentProps} from 'react';

interface LikeButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'children' | 'onClick'
> {
  likeable: Likeable;
}
export function LikeButton({
  likeable,
  disabled,
  ...buttonProps
}: LikeButtonProps) {
  const authHandler = useAuthClickCapture();
  const addToLibrary = useAddItemsToLibrary();
  const removeFromLibrary = useRemoveItemsFromLibrary();
  const isLiked = useLibraryStore(s => s.has(likeable));
  const isLoading = addToLibrary.isPending || removeFromLibrary.isPending;
  const isOffline = useIsOffline();

  const labels = getLabels(likeable);

  return (
    <Button
      {...buttonProps}
      variant="outline"
      disabled={disabled || isLoading || isOffline}
      onClickCapture={authHandler}
      onClick={() => {
        if (isLiked) {
          removeFromLibrary.mutate({likeables: [likeable]});
        } else {
          addToLibrary.mutate({likeables: [likeable]});
        }
      }}
    >
      <HeartIcon
        data-icon="inline-start"
        className={isLiked ? 'text-primary' : undefined}
        fill={isLiked ? 'currentColor' : 'none'}
      />
      <Trans {...(isLiked ? labels.removeLike : labels.like)} />
    </Button>
  );
}

function getLabels(likeable: Likeable) {
  switch (likeable.model_type) {
    case 'artist':
      return {like: message('Follow'), removeLike: message('Following')};
    default:
      return {like: message('Like'), removeLike: message('Liked')};
  }
}
