import {Skeleton} from '@shadcn/skeleton/skeleton';
import {ReactNode} from 'react';

/**
 * Per-section loading placeholders.
 *
 * The previous `Suspense fallback={null}` rendered nothing while a lazy section
 * downloaded, so the page grew by a whole section's height as each chunk
 * arrived. That is a large, repeated layout shift, and it is worst on exactly
 * the connection the visitor is most likely to be on.
 *
 * Each placeholder is sized to roughly match the real section so the swap is
 * close to shift-free, and each uses the theme's own muted tokens so it reads
 * correctly in both light and dark. All classes therefore come from
 * `common.css`/`keekii-brand.css` — no hard-coded colours.
 *
 * The name -> component registry lives in `section-skeletons.ts` so this file
 * exports only components, which keeps fast refresh working.
 */

const spacingClasses: Record<string, string> = {
  compact: 'py-16 sm:py-20',
  default: 'py-24 sm:py-32',
  spacious: 'py-28 sm:py-40',
};

const backgroundClasses: Record<string, string> = {
  default: 'bg-background',
  muted: 'bg-muted/40 dark:bg-card',
  elevated: 'bg-card/80 dark:bg-muted/30',
  panel: 'border-y border-border bg-muted/40 dark:bg-card',
};

export type SectionSkeletonProps = {
  background?: string;
  spacing?: string;
  align?: 'center' | 'left';
};

/** Vertical rhythm and background, mirroring `SectionShell`. */
export function SectionSkeleton({
  background,
  spacing,
  children,
}: SectionSkeletonProps & {children: ReactNode}) {
  return (
    <div aria-hidden className={backgroundClasses[background ?? 'default']}>
      <div
        className={`mx-auto w-full max-w-7xl px-6 lg:px-8 ${
          spacingClasses[spacing ?? 'default']
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/** A heading block, matching what `SectionHeading` reserves vertically. */
export function SkeletonHeading({align}: {align?: 'center' | 'left'}) {
  return (
    <div className={align === 'left' ? 'text-left' : 'text-center'}>
      <Skeleton className="mx-auto h-4 w-32" />
      <Skeleton className="mx-auto mt-5 h-9 w-full max-w-xl" />
      <Skeleton className="mx-auto mt-4 h-4 w-full max-w-md" />
    </div>
  );
}

/** A grid of cards, matching `features-grid` at its default column count. */
export function SkeletonCardGrid({count = 3}: {count?: number}) {
  return (
    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({length: count}, (_, i) => (
        <div key={i} className="bg-card border-border rounded-card border p-6">
          <Skeleton className="size-11 rounded-card-sm" />
          <Skeleton className="mt-5 h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

/** A screenshot beside text, matching `feature-with-screenshot`. */
export function SkeletonScreenshotSplit() {
  return (
    <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
      <div>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-8 h-8 w-full" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <Skeleton className="mt-8 h-11 w-40 rounded-button" />
      </div>
      <Skeleton className="aspect-4/3 w-full rounded-card" />
    </div>
  );
}

/** A two-column plan table, matching `pricing`. */
export function SkeletonPricing() {
  return (
    <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2">
      {Array.from({length: 2}, (_, i) => (
        <div key={i} className="bg-card border-border rounded-card border p-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-10 w-32" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-2/3" />
          <Skeleton className="mt-8 h-11 w-full rounded-button" />
        </div>
      ))}
    </div>
  );
}

/** A row of accordions, matching `faq`. */
export function SkeletonFaq() {
  return (
    <div className="mx-auto mt-16 flex max-w-3xl flex-col gap-4">
      {Array.from({length: 5}, (_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-card-sm" />
      ))}
    </div>
  );
}

/** Centred copy and a call to action, matching `cta-simple-centered`. */
export function SkeletonCta() {
  return (
    <div className="flex flex-col items-center text-center">
      <Skeleton className="h-9 w-full max-w-lg" />
      <Skeleton className="mt-4 h-4 w-full max-w-md" />
      <Skeleton className="mt-8 h-12 w-48 rounded-button" />
    </div>
  );
}

/** A link row, matching `footer`. */
export function SkeletonFooter() {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-6">
        {Array.from({length: 4}, (_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
    </div>
  );
}

/**
 * Generic fallback for a section with no bespoke placeholder, so an unfamiliar
 * section still reserves space rather than collapsing to nothing.
 */
export function GenericSectionSkeleton(props: SectionSkeletonProps) {
  return (
    <SectionSkeleton {...props}>
      <SkeletonHeading align={props.align} />
      <div className="mt-16 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </SectionSkeleton>
  );
}

/**
 * Placeholder for a given section name.
 *
 * This is a switch rather than a `Record<name, Component>` on purpose: a module
 * that exports both a registry object and components breaks React fast refresh,
 * and `oxlint`'s `react/only-export-components` rule (an error in this repo)
 * correctly rejects it.
 *
 * A name with no case falls through to {@link GenericSectionSkeleton}. That is
 * deliberate and not an oversight: sections registered by the app, and sections
 * added later, must still reserve space before anyone remembers to add a case.
 */
export function SectionFallback({
  name,
  ...props
}: SectionSkeletonProps & {name: string}) {
  switch (name) {
    case 'features-grid':
      return (
        <SectionSkeleton {...props}>
          <SkeletonHeading align={props.align} />
          <SkeletonCardGrid />
        </SectionSkeleton>
      );
    case 'faq':
      return (
        <SectionSkeleton {...props}>
          <SkeletonHeading align={props.align} />
          <SkeletonFaq />
        </SectionSkeleton>
      );
    case 'pricing':
      return (
        <SectionSkeleton {...props}>
          <SkeletonHeading align={props.align} />
          <SkeletonPricing />
        </SectionSkeleton>
      );
    case 'cta-simple-centered':
      return (
        <SectionSkeleton {...props}>
          <SkeletonCta />
        </SectionSkeleton>
      );
    case 'footer':
      return (
        <SectionSkeleton {...props}>
          <SkeletonFooter />
        </SectionSkeleton>
      );
    // App-registered section: a grid of channel content.
    case 'channel':
      return (
        <SectionSkeleton {...props}>
          <SkeletonHeading align={props.align} />
          <SkeletonCardGrid count={4} />
        </SectionSkeleton>
      );
    default:
      return <GenericSectionSkeleton {...props} />;
  }
}
