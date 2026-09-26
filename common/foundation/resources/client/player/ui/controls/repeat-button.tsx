import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {MediaRepeatIcon} from '@ui/icons/media/media-repeat';
import {MediaRepeatOnIcon} from '@ui/icons/media/media-repeat-on';
import {cn} from '@ui/utils/cn';
import {ReactElement} from 'react';

interface Props {
  className?: string;
}
export function RepeatButton({className}: Props) {
  const playerReady = usePlayerStore(s => s.providerReady);
  const repeating = usePlayerStore(s => s.repeat);
  const player = usePlayerActions();

  let label: ReactElement<MessageDescriptor>;
  if (repeating === 'all') {
    label = <Trans message="Enable repeat one" />;
  } else if (repeating === 'one') {
    label = <Trans message="Disable repeat" />;
  } else {
    label = <Trans message="Enable repeat" />;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            disabled={!playerReady}
            variant="ghost"
            size="icon"
            className={cn(repeating ? 'text-primary' : undefined, className)}
            onClick={() => {
              player.toggleRepeatMode();
            }}
          />
        }
      >
        {repeating === 'one' ? (
          <MediaRepeatOnIcon className="size-5" />
        ) : (
          <MediaRepeatIcon className="size-5" />
        )}
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip.Root>
  );
}
