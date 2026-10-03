import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {Timer} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';

// Minutes for the timer picker — user cycles through these options
const TIMER_OPTIONS_MINUTES = [5, 10, 15, 30, 60] as const;

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SleepTimerButton() {
  // null = off; number = unix timestamp when timer should fire
  const [fireAt, setFireAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [optionIndex, setOptionIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pause = usePlayerStore(s => s.pause);

  // Tick every second while timer is active
  useEffect(() => {
    if (fireAt === null) {
      setRemaining(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const tick = () => {
      const diff = fireAt - Date.now();
      if (diff <= 0) {
        pause();
        setFireAt(null);
        setRemaining(null);
        clearInterval(intervalRef.current!);
      } else {
        setRemaining(diff);
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [fireAt, pause]);

  const startTimer = useCallback(() => {
    if (fireAt !== null) {
      // Cancel existing timer
      setFireAt(null);
      return;
    }
    const minutes = TIMER_OPTIONS_MINUTES[optionIndex];
    setFireAt(Date.now() + minutes * 60 * 1000);
    setOptionIndex(i => (i + 1) % TIMER_OPTIONS_MINUTES.length);
  }, [fireAt, optionIndex]);

  const isActive = fireAt !== null;
  const nextMinutes = TIMER_OPTIONS_MINUTES[optionIndex];

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={isActive}
            onClick={startTimer}
            className={isActive ? 'text-[var(--be-brand-ink)]' : 'text-muted-foreground'}
          />
        }
      >
        <Timer className="size-5" />
        {isActive && remaining !== null && (
          <span className="absolute -top-1 -right-1 rounded-full bg-[var(--be-brand-ink)] px-1 py-px text-[9px] font-bold leading-none text-white tabular-nums">
            {formatRemaining(remaining)}
          </span>
        )}
      </Tooltip.Trigger>
      <Tooltip.Content>
        {isActive ? (
          <Trans
            message="Sleep timer active — tap to cancel"
          />
        ) : (
          <Trans
            message="Sleep in :minutes min"
            values={{minutes: nextMinutes}}
          />
        )}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
