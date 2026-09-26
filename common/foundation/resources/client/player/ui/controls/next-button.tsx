import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {MediaNextIcon} from '@ui/icons/media/media-next';
import {cn} from '@ui/utils/cn';

interface Props {
  className?: string;
  iconClassName?: string;
  stopPropagation?: boolean;
}
export function NextButton({className, iconClassName, stopPropagation}: Props) {
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
              player.playNext();
            }}
          />
        }
      >
        <MediaNextIcon className={cn('size-6', iconClassName)} />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Trans message="Next" />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
