import {useIsFollowingPlaylist} from '@app/web-player/playlists/hooks/use-is-following-playlist';
import {usePlaylistPermissions} from '@app/web-player/playlists/hooks/use-playlist-permissions';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {useFollowPlaylist} from '@app/web-player/playlists/requests/use-follow-playlist';
import {useUnfollowPlaylist} from '@app/web-player/playlists/requests/use-unfollow-playlist';
import {Button} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {HeartIcon} from 'lucide-react';

interface FollowPlaylistButtonProps {
  buttonType: 'icon' | 'text';
  className?: string;
  playlist: PartialPlaylist;
}
export function FollowPlaylistButton({
  playlist,
  className,
  buttonType = 'text',
}: FollowPlaylistButtonProps) {
  const {isCreator} = usePlaylistPermissions(playlist);
  const follow = useFollowPlaylist(playlist);
  const unfollow = useUnfollowPlaylist(playlist);
  const isFollowing = useIsFollowingPlaylist(playlist.id);
  const isLoading = follow.isPending || unfollow.isPending;
  const isIcon = buttonType === 'icon';

  if (isCreator) {
    return null;
  }

  return (
    <Button
      variant={isIcon ? 'ghost' : 'outline'}
      size={isIcon ? 'icon' : 'default'}
      color={isIcon && isFollowing ? 'primary' : 'default'}
      className={cn(!isIcon && 'rounded-full', className)}
      disabled={isLoading}
      onClick={() => {
        if (isFollowing) {
          unfollow.mutate();
        } else {
          follow.mutate();
        }
      }}
    >
      <HeartIcon
        data-icon={isIcon ? undefined : 'inline-start'}
        className={!isIcon && isFollowing ? 'text-primary' : undefined}
        fill={isFollowing ? 'currentColor' : 'none'}
      />
      {!isIcon &&
        (isFollowing ? (
          <Trans message="Following" />
        ) : (
          <Trans message="Follow" />
        ))}
    </Button>
  );
}
