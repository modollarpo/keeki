import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button, ButtonColor, ButtonSize} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {MediaClosedCaptionsIcon} from '@ui/icons/media/media-closed-captions';
import {MediaClosedCaptionsOnIcon} from '@ui/icons/media/media-closed-captions-on';

interface Props {
  color?: ButtonColor;
  size?: ButtonSize;
  className?: string;
}
export function ToggleCaptionsButton({
  size = 'icon',
  color,
  className,
}: Props) {
  const {trans} = useTrans();
  const player = usePlayerActions();
  const playerReady = usePlayerStore(s => s.providerReady);
  const captionsVisible = usePlayerStore(s => s.textTrackIsVisible);
  const haveCaptions = usePlayerStore(s => !!s.textTracks.length);

  if (!haveCaptions) {
    return null;
  }

  const labelMessage = trans(
    captionsVisible
      ? message('Hide subtitles/captions (c)')
      : message('Show subtitles/captions (c)'),
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
              player.setTextTrackVisibility(!captionsVisible);
            }}
          />
        }
      >
        {captionsVisible ? (
          <MediaClosedCaptionsOnIcon className="size-5" />
        ) : (
          <MediaClosedCaptionsIcon className="size-5" />
        )}
      </Tooltip.Trigger>
      <Tooltip.Content>{labelMessage}</Tooltip.Content>
    </Tooltip.Root>
  );
}
