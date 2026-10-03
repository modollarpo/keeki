import {getAutoplayEnabled, setAutoplayEnabled} from '@app/web-player/state/player-store-options';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {Infinity} from 'lucide-react';
import {useState} from 'react';

export function AutoplayButton() {
  const [enabled, setEnabled] = useState(getAutoplayEnabled);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={enabled}
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              setAutoplayEnabled(next);
            }}
            className={enabled ? 'text-[var(--be-brand-ink)]' : 'text-muted-foreground'}
          />
        }
      >
        <Infinity className="size-5" />
      </Tooltip.Trigger>
      <Tooltip.Content>
        {enabled ? (
          <Trans message="Autoplay on — click to turn off" />
        ) : (
          <Trans message="Autoplay off — click to turn on" />
        )}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
