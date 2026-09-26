import {Likeable} from '@app/web-player/library/likeable';
import {useAddItemsToLibrary} from '@app/web-player/library/requests/use-add-items-to-library';
import {useRemoveItemsFromLibrary} from '@app/web-player/library/requests/use-remove-items-from-library';
import {useLibraryStore} from '@app/web-player/library/state/likes-store';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {Button, type ButtonSize} from '@shadcn/button/button';
import {HeartIcon} from 'lucide-react';

interface LikeIconButtonProps {
  likeable: Likeable;
  size?: ButtonSize;
  className?: string;
}
export function LikeIconButton({
  likeable,
  size = 'icon',
  className,
}: LikeIconButtonProps) {
  const authHandler = useAuthClickCapture();
  const addToLibrary = useAddItemsToLibrary();
  const removeFromLibrary = useRemoveItemsFromLibrary();
  const isLiked = useLibraryStore(s => s.has(likeable));
  const isLoading = addToLibrary.isPending || removeFromLibrary.isPending;
  const isOffline = useIsOffline();
  const isDisabled = isLoading || isOffline;

  return (
    <Button
      variant="ghost"
      size={size}
      color={isLiked ? 'primary' : 'default'}
      className={className}
      disabled={isDisabled}
      onClickCapture={authHandler}
      onClick={e => {
        e.stopPropagation();
        if (isLiked) {
          removeFromLibrary.mutate({likeables: [likeable]});
        } else {
          addToLibrary.mutate({likeables: [likeable]});
        }
      }}
    >
      <HeartIcon fill={isLiked ? 'currentColor' : 'none'} />
    </Button>
  );
}
