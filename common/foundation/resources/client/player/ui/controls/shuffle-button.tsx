import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {MediaShuffleIcon} from '@ui/icons/media/media-shuffle';
import {MediaShuffleOnIcon} from '@ui/icons/media/media-shuffle-on';
import {cn} from '@ui/utils/cn';

interface Props {
  className?: string;
}
export function ShuffleButton({className}: Props) {
  const playerReady = usePlayerStore(s => s.providerReady);
  const isShuffling = usePlayerStore(s => s.shuffling);
  const player = usePlayerActions();

  const label = isShuffling ? (
    <Trans message="Disable shuffle" />
  ) : (
    <Trans message="Enable shuffle" />
  );

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            disabled={!playerReady}
            variant="ghost"
            size="icon"
            className={cn(isShuffling ? 'text-primary' : undefined, className)}
            onClick={() => {
              player.toggleShuffling();
            }}
          />
        }
      >
        {isShuffling ? (
          <MediaShuffleOnIcon className="size-5" />
        ) : (
          <MediaShuffleIcon className="size-5" />
        )}
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip.Root>
  );
}
