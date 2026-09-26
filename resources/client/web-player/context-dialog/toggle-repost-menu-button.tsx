import {PartialAlbum} from '@app/web-player/albums/album';
import {ContextMenuButton} from '@app/web-player/context-dialog/context-dialog-layout';
import {useRepostsStore} from '@app/web-player/library/state/reposts-store';
import {useToggleRepost} from '@app/web-player/reposts/use-toggle-repost';
import {Track} from '@app/web-player/tracks/track';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {Repeat2Icon} from 'lucide-react';

interface Props {
  item: Track | PartialAlbum;
}
export function ToggleRepostMenuButton({item}: Props) {
  const authHandler = useAuthClickCapture();
  const {player} = useSettings();
  const toggleRepost = useToggleRepost();
  const isReposted = useRepostsStore(s => s.has(item));
  if (!player?.enable_repost) return null;

  return (
    <ContextMenuButton
      startIcon={<Repeat2Icon />}
      onClickCapture={authHandler}
      onClick={() => {
        toggleRepost.mutate({repostable: item});
      }}
    >
      {isReposted ? <Trans message="Reposted" /> : <Trans message="Repost" />}
    </ContextMenuButton>
  );
}
