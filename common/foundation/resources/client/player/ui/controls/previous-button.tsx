import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {MediaPreviousIcon} from '@ui/icons/media/media-previous';
import {cn} from '@ui/utils/cn';

interface Props {
  className?: string;
  stopPropagation?: boolean;
  iconClassName?: string;
}
export function PreviousButton({
  className,
  iconClassName,
  stopPropagation,
}: Props) {
  const player = usePlayerActions();
  const playerReady = usePlayerStore(s => s.providerReady);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            disabled={!playerReady}
            variant="ghost"
            size="icon"
            className={className}
            onClick={e => {
              if (stopPropagation) {
                e.stopPropagation();
              }
              player.playPrevious();
            }}
          />
        }
      >
        <MediaPreviousIcon className={cn('size-6', iconClassName)} />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Trans message="Previous" />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
