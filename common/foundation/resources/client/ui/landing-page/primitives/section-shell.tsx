import {
  SectionBackground,
  SectionSpacing,
} from '@common/ui/landing-page/landing-page-config';
import {cn} from '@ui/utils/cn';
import {ReactNode} from 'react';

type SectionShellProps = {
  children: ReactNode;
  className?: string;
  /** Container width/edge classes. Defaults to the standard landing container. */
  containerClassName?: string;
  background?: SectionBackground;
  spacing?: SectionSpacing;
  id?: string;
};

const spacingClasses: Record<SectionSpacing, string> = {
  compact: 'py-8 sm:py-12',
  default: 'py-12 sm:py-16',
  spacious: 'py-16 sm:py-24',
};

const backgroundClasses: Record<SectionBackground, string> = {
  default: 'bg-background',
  muted: 'bg-muted/40 dark:bg-card',
  elevated: 'bg-card/80 dark:bg-muted/30',
  panel: 'border-y border-border bg-muted/40 dark:bg-card',
};

/**
 * Shared vertical rhythm and background treatment for every non-hero landing
 * section. Keeps spacing and background banding consistent across the page so the
 * redesign stays coherent even when sections are reordered in the admin.
 */
export function SectionShell({
  children,
  className,
  containerClassName,
  background = 'default',
  spacing = 'default',
  id,
}: SectionShellProps) {
  return (
    <div id={id} className={cn(backgroundClasses[background], className)}>
      <div
        className={cn(
          containerClassName ??
            'mx-auto w-full max-w-7xl px-6 lg:px-8',
          spacingClasses[spacing],
        )}
      >
        {children}
      </div>
    </div>
  );
}