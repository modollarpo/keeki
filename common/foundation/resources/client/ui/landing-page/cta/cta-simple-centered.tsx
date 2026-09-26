import {Buttons} from '@common/ui/landing-page/hero/shared';
import {LandingPageButtonConfig, SectionPresentation} from '@common/ui/landing-page/landing-page-config';
import {SectionHeading} from '@common/ui/landing-page/primitives/section-heading';
import {SectionShell} from '@common/ui/landing-page/primitives/section-shell';
import clsx from 'clsx';

export type CtaSimpleCenteredConfig = SectionPresentation & {
  name: 'cta-simple-centered';
  title?: string;
  description?: string;
  buttons?: LandingPageButtonConfig[];
  forceDarkMode?: boolean;
};

type Props = {
  config: CtaSimpleCenteredConfig;
};

export function CtaSimpleCentered({config}: Props) {
  const variant = config.variant ?? 'card';
  return (
    <SectionShell
      background={config.background}
      spacing={config.spacing}
      className={clsx(config.forceDarkMode && 'dark')}
    >
      {variant === 'full' ? (
        <FullBleedCta config={config} />
      ) : (
        <CardCta config={config} />
      )}
    </SectionShell>
  );
}

function CardCta({config}: Props) {
  return (
    <div className="relative isolate overflow-hidden border border-border/80 bg-muted/40 px-6 py-24 shadow-sm sm:rounded-3xl sm:px-6 dark:bg-card">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading
          title={config.title}
          description={config.description}
          align="center"
        />
        {config.buttons?.length ? (
          <Buttons
            buttons={config.buttons}
            className="mt-10 flex items-center justify-center gap-x-6"
          />
        ) : null}
        <Gradient />
      </div>
    </div>
  );
}

function FullBleedCta({config}: Props) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/25 via-primary/10 to-primary/25 px-6 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading
          title={config.title}
          description={config.description}
          align="center"
        />
        {config.buttons?.length ? (
          <Buttons
            buttons={config.buttons}
            className="mt-10 flex items-center justify-center gap-x-6"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/30 to-transparent"
        />
      </div>
    </div>
  );
}

function Gradient() {
  return (
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]"
    >
      <circle
        r={512}
        cx={512}
        cy={512}
        fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
        fillOpacity="0.7"
      />
      <defs>
        <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
          <stop stopColor="color-mix(in oklab, var(--be-primary) 25%, transparent)" />
          <stop offset={1} stopColor="var(--be-primary)" />
        </radialGradient>
      </defs>
    </svg>
  );
}