import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button, ButtonColor, ButtonSize} from '@shadcn/button/button';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {MediaSeekForward15Icon} from '@ui/icons/media/media-seek-forward15';
import {ReactNode} from 'react';

interface Props {
  color?: ButtonColor;
  size?: ButtonSize;
  className?: string;
  seconds?: number | string;
  children?: ReactNode;
}
export function SeekButton({
  size = 'icon',
  color,
  className,
  seconds = '+15',
  children,
}: Props) {
  const {trans} = useTrans();
  const player = usePlayerActions();
  const playerReady = usePlayerStore(s => s.providerReady);

  return (
    <Button
      disabled={!playerReady}
      aria-label={trans(message('Next'))}
      variant="ghost"
      size={size}
      color={color}
      className={className}
      onClick={() => {
        player.seek(seconds);
      }}
    >
      {children || <MediaSeekForward15Icon className="size-5" />}
    </Button>
  );
}
