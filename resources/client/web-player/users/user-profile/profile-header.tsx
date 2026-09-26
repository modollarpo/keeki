import {BulletSeparatedItems} from '@app/web-player/layout/bullet-separated-items';
import {
  actionButtonClassName,
  MediaPageHeaderLayout,
} from '@app/web-player/layout/media-page-header-layout';
import {UserImage} from '@app/web-player/users/user-image';
import {FullUserProfile} from '@app/web-player/users/user-profile';
import {EditProfileDialog} from '@app/web-player/users/user-profile/edit-profile-dialog';
import {ProfileDescription} from '@app/web-player/users/user-profile/profile-description';
import {useAuth} from '@common/auth/use-auth';
import {FollowButton} from '@common/users/follow-button';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {PencilIcon} from 'lucide-react';
import {Link} from 'react-router';

interface ProfileHeaderProps {
  user: FullUserProfile;
  tabLink: (tabName: string) => string;
}

export function ProfileHeader({user, tabLink}: ProfileHeaderProps) {
  const {user: currentUser} = useAuth();

  return (
    <MediaPageHeaderLayout
      image={<UserImage user={user} className="rounded-full" showProBadge />}
      title={user.name}
      subtitle={
        <BulletSeparatedItems className="text-muted-foreground z-20 mx-auto w-max text-sm">
          {user.followers_count && user.followers_count > 0 ? (
            <Link to={tabLink('followers')} className="hover:underline">
              <Trans
                message=":count followers"
                values={{count: user.followers_count}}
              />
            </Link>
          ) : null}
          {user.followed_users_count && user.followed_users_count > 0 ? (
            <Link to={tabLink('following')} className="hover:underline">
              <Trans
                message="Following :count"
                values={{count: user.followed_users_count}}
              />
            </Link>
          ) : null}
        </BulletSeparatedItems>
      }
      actionsBar={
        <div className="flex min-w-0 items-center justify-center md:justify-start">
          <FollowButton
            user={user}
            variant="default"
            color="primary"
            className={cn(
              actionButtonClassName({isFirst: true}),
              'min-w-none rounded-full',
            )}
          />
          {currentUser?.id === user.id && <EditButton user={user} />}
        </div>
      }
      footer={<ProfileDescription profile={user.profile} links={user.links} />}
    />
  );
}

interface EditButtonProps {
  user: FullUserProfile;
}

function EditButton({user}: EditButtonProps) {
  return (
    <EditProfileDialog user={user}>
      <Dialog.Trigger
        render={
          <Button
            variant="outline"
            className={cn(actionButtonClassName(), 'rounded-full')}
          />
        }
      >
        <PencilIcon />
        <Trans message="Edit" />
      </Dialog.Trigger>
    </EditProfileDialog>
  );
}
