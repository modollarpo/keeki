import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {HourglassEmptyIcon} from '@ui/icons/material/HourglassEmpty';
import clsx from 'clsx';

interface Props {
  isOnline?: boolean;
  showAwayIcon?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export function OnlineStatusCircle(props: Props) {
  const {isOnline, color, className, showAwayIcon} = props;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <div
            className={clsx(
              'flex items-center justify-center rounded-full border border-primary-foreground bg-clip-padding',
              color ? color : isOnline ? 'bg-positive' : 'bg-secondary',
              getSize(props),
              className,
            )}
          />
        }
      >
        {!isOnline && showAwayIcon && (
          <HourglassEmptyIcon size="2xs" className="text-muted-foreground" />
        )}
      </Tooltip.Trigger>
      <Tooltip.Content>
        {isOnline ? (
          <Trans message="Online" />
        ) : showAwayIcon ? (
          <Trans message="Away" />
        ) : (
          <Trans message="Offline" />
        )}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

function getSize({size, showAwayIcon, isOnline}: Props) {
  switch (size) {
    case 'md':
      return 'h-5 w-5';
    case 'lg':
      return 'h-8.5 w-8.5';
    default:
      return !isOnline && showAwayIcon ? 'h-4.5 w-4.5' : 'h-3 w-3';
  }
}
