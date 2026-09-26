import {useAuth} from '@common/auth/use-auth';
import {useFollowUser} from '@common/users/queries/use-follow-user';
import {useIsUserFollowing} from '@common/users/queries/use-followed-users';
import {useUnfollowUser} from '@common/users/queries/use-unfollow-user';
import {Button} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {ComponentProps} from 'react';

interface Props extends Omit<
  ComponentProps<typeof Button>,
  'onClick' | 'disabled'
> {
  user: {
    id: number;
    name: string;
  };
}
export function FollowButton({user, className, ...buttonProps}: Props) {
  const {user: currentUser} = useAuth();
  const {isFollowing, isLoading} = useIsUserFollowing(user.id);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const mergedClassName = cn(className, 'min-w-20.5');

  if (isFollowing) {
    return (
      <Button
        {...buttonProps}
        className={mergedClassName}
        onClick={() => unfollowUser.mutate({user})}
        disabled={
          !currentUser ||
          currentUser?.id === user.id ||
          unfollowUser.isPending ||
          isLoading
        }
      >
        <Trans message="Unfollow" />
      </Button>
    );
  }

  return (
    <Button
      {...buttonProps}
      className={mergedClassName}
      onClick={() => followUser.mutate({user})}
      disabled={
        !currentUser ||
        currentUser?.id === user.id ||
        followUser.isPending ||
        isLoading
      }
    >
      <Trans message="Follow" />
    </Button>
  );
}
