import {UserImage} from '@app/web-player/users/user-image';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {UserProfileLink} from '@app/web-player/users/user-profile-link';
import {FollowButton} from '@common/users/follow-button';
import {Trans} from '@ui/i18n/trans';

interface Props {
  follower: PartialUserProfile;
}
export function FollowerListItem({follower}: Props) {
  return (
    <div
      key={follower.id}
      className="mb-4 flex items-center gap-4 border-b pb-4"
    >
      <UserImage user={follower} className="h-16 w-16 rounded" />
      <div className="text-sm">
        <UserProfileLink user={follower} />
        {follower.followers_count && follower.followers_count > 0 ? (
          <div className="text-muted-foreground text-xs">
            <Trans
              message="[one 1 followers|other :count followers]"
              values={{count: follower.followers_count}}
            />
          </div>
        ) : null}
      </div>
      <FollowButton
        user={follower}
        variant="outline"
        className="ml-auto shrink-0 rounded-full"
      />
    </div>
  );
}
