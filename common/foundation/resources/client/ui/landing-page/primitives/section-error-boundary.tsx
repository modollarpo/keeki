import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';
import {ErrorInfo, ReactNode} from 'react';

/**
 * Isolates each landing section so a single broken section cannot blank the
 * whole page.
 *
 * Before this, one bad config in one section took down the entire page. On a
 * marketing page that is the worst possible failure: the hero disappears
 * because a pricing table threw, and the visitor is left with a blank screen
 * and no way forward.
 *
 * The fallback is deliberately quiet and uses theme tokens rather than a
 * dialog, because the correct behaviour for a visitor is "the page still
 * works, one block is missing", not an interruption.
 *
 * Uses the `react-error-boundary` package already in `package.json` rather than
 * a hand-rolled class component.
 */
type Props = {
  children: ReactNode;
  /**
   * Included in the reported error and in the fallback's `data-` attribute so
   * the failing section is identifiable without cross-referencing config.
   */
  sectionName: string;
  /** Rendered instead of `children` once a render error has been caught. */
  fallback?: ReactNode;
  /**
   * Called after an error is caught. Left injectable so the app can report to
   * its own logger; nothing is sent anywhere by default, because no reporting
   * backend has been chosen and `@sentry/react` is present in `package.json`
   * but never initialised.
   *
   * `error` is `unknown` to match `react-error-boundary`'s own callback type,
   * so the two compose without a cast. Narrow before use if you need fields.
   */
  onError?: (error: unknown, info: ErrorInfo) => void;
};

export function SectionErrorBoundary({children, sectionName, fallback, onError}: Props) {
  return (
    <ErrorBoundary
      fallbackRender={
        fallback
          ? () => fallback
          : () => <SectionErrorFallback sectionName={sectionName} />
      }
      onError={(error, info) => {
        console.error(
          `[landing-page] section "${sectionName}" failed to render`,
          error,
          info.componentStack,
        );
        onError?.(error, info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Default fallback. `aria-hidden` keeps it out of the accessibility tree: it
 * carries no information a screen-reader user needs, and announcing "content
 * unavailable" for every failed section would be noise. The failure is still
 * reported to the console and to `onError`.
 */
function SectionErrorFallback({sectionName}: {sectionName: string}) {
  return (
    <div
      aria-hidden
      data-section-error={sectionName}
      className="bg-background border-y border-border/50"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
        <div className="bg-muted/60 h-6 w-56 rounded-card-sm" />
        <div className="bg-muted/60 mt-4 h-4 w-full max-w-md rounded-card-sm" />
      </div>
    </div>
  );
}

/** Re-exported so callers can build a typed fallback without importing the package. */
export type {FallbackProps};
