import {PartialAlbum} from '@app/web-player/albums/album';
import {useRepostsStore} from '@app/web-player/library/state/reposts-store';
import {useToggleRepost} from '@app/web-player/reposts/use-toggle-repost';
import {Track} from '@app/web-player/tracks/track';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {Button} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {RepeatIcon} from 'lucide-react';
import {ComponentProps} from 'react';

interface RepostButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'children' | 'onClick'
> {
  item: Track | PartialAlbum;
}
export function RepostButton({
  item,
  disabled,
  size = 'sm',
  ...buttonProps
}: RepostButtonProps) {
  const authHandler = useAuthClickCapture();
  const {player} = useSettings();
  const toggleRepost = useToggleRepost();
  const isReposted = useRepostsStore(s => s.has(item));
  const isOffline = useIsOffline();

  if (!player?.enable_repost) return null;

  return (
    <Button
      {...buttonProps}
      variant="outline"
      size={size}
      disabled={disabled || toggleRepost.isPending || isOffline}
      onClickCapture={authHandler}
      onClick={() => toggleRepost.mutate({repostable: item})}
    >
      <RepeatIcon
        data-icon="inline-start"
        className={isReposted ? 'text-primary' : undefined}
      />
      {isReposted ? <Trans message="Reposted" /> : <Trans message="Repost" />}
    </Button>
  );
}
