import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button, ButtonColor, ButtonSize} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {MediaFullscreenIcon} from '@ui/icons/media/media-fullscreen';
import {MediaFullscreenExitIcon} from '@ui/icons/media/media-fullscreen-exit';

interface Props {
  color?: ButtonColor;
  size?: ButtonSize;
  className?: string;
}
export function FullscreenButton({size = 'icon', color, className}: Props) {
  const {trans} = useTrans();
  const player = usePlayerActions();
  const playerReady = usePlayerStore(s => s.providerReady);
  const isFullscreen = usePlayerStore(s => s.isFullscreen);
  const canFullscreen = usePlayerStore(s => s.canFullscreen);

  if (!canFullscreen) {
    return null;
  }

  const labelMessage = trans(
    isFullscreen
      ? message('Exit fullscreen (f)')
      : message('Enter fullscreen (f)'),
  );

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            disabled={!playerReady}
            aria-label={labelMessage}
            variant="ghost"
            size={size}
            color={color}
            className={className}
            onClick={() => {
              if (isFullscreen) {
                player.exitFullscreen();
              } else {
                player.enterFullscreen();
              }
            }}
          />
        }
      >
        {isFullscreen ? (
          <MediaFullscreenExitIcon className="size-5" />
        ) : (
          <MediaFullscreenIcon className="size-5" />
        )}
      </Tooltip.Trigger>
      <Tooltip.Content>{labelMessage}</Tooltip.Content>
    </Tooltip.Root>
  );
}
