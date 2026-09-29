/**
 * Typed analytics facade for landing-page engagement.
 *
 * ── Read this before adding an event ──────────────────────────────────────
 * This app has no consent mechanism. There is no cookie banner, no consent
 * store, and no consent gate anywhere in the codebase. `framework.blade.php`
 * loads gtag.js whenever `analytics.tracking_code` is set in the database, and
 * that is the only condition — nothing checks whether the visitor agreed.
 *
 * So this facade is deliberately inert by default. `LandingAnalytics` sends
 * nothing unless a provider has been registered *and* consent has been granted.
 * With no provider registered — which is the state of a fresh checkout — every
 * call is a no-op and nothing leaves the browser.
 *
 * This is a seam, not a consent implementation. Wiring it up requires a
 * decision that has not been made: which vendor, and what consent UI and legal
 * copy go with it. Do not add a tracking vendor here, and do not register a
 * provider that bypasses `hasAnalyticsConsent`.
 *
 * ── gtag.js loading, audited 2026-09-29 ───────────────────────────────────
 * There is no duplicate loader. `framework.blade.php:124-142` is the only
 * place `googletagmanager.com/gtag/js` is referenced in the repository, it is
 * behind `settings('analytics.tracking_code')`, and nothing in the JavaScript
 * bundle loads or calls `gtag` — it is not referenced from any `.ts`/`.tsx`
 * file. The one Blade include runs on a full document load, so it cannot fire
 * twice.
 *
 * The real hazard for whoever implements this facade is the opposite one, and
 * it is worth knowing before writing the provider rather than after:
 *
 *   `gtag('config', ID)` sends an automatic `page_view` on load. This app is
 *   client-routed with react-router, so a route change does not reload the
 *   document and fires no pageview at all — SPA navigation is currently
 *   invisible to GA. The obvious fix, sending a pageview per route, will
 *   therefore double-count the first view unless the initial config is changed
 *   to `gtag('config', ID, {send_page_view: false})` and the first route is
 *   counted explicitly.
 *
 * That is a note, not a task. Changing it alters reported analytics numbers,
 * so it belongs with the vendor decision above rather than in a side commit.
 */

/**
 * Events a visitor can generate on a landing page.
 *
 * Discriminated rather than a free-form string so a typo fails at build time
 * instead of silently creating a new event in whatever tool receives it.
 *
 * Note what is deliberately absent: no artist/track/album ids, no search terms,
 * no email, no session identifiers, no PII of any kind. Analytics here answers
 * "which parts of this page work", not "who is this person".
 */
export type LandingAnalyticsEvent =
  | {name: 'landing_cta_clicked'; cta: string; placement: string}
  | {name: 'landing_plan_selected'; plan: string; placement: string}
  | {name: 'landing_faq_toggled'; question: string; state: 'opened' | 'closed'}
  | {name: 'landing_video_played'; placement: string}
  | {name: 'landing_section_viewed'; section: string}
  | {name: 'landing_signup_started'; placement: string};

/**
 * A concrete destination for events. Implement this against a real provider —
 * the shape is the whole contract, so an implementation can be swapped without
 * touching call sites.
 */
export interface LandingAnalyticsProvider {
  send: (event: LandingAnalyticsEvent) => void;
}

let provider: LandingAnalyticsProvider | null = null;
let consentGranted = false;
let hasWarnedAboutMissingSink = false;

/**
 * Reads whether the visitor has consented. Kept separate from the provider so a
 * provider cannot be registered in a way that also implies consent.
 */
export function hasAnalyticsConsent(): boolean {
  return consentGranted;
}

/**
 * Grant consent. Nothing should call this until a real consent mechanism exists
 * and a visitor has actually agreed — a call here is a legal decision, not a
 * technical one.
 */
export function grantAnalyticsConsent(granted: boolean) {
  consentGranted = granted;
}

/** Register the destination for events. Passing `null` disables sending. */
export function setAnalyticsProvider(next: LandingAnalyticsProvider | null) {
  provider = next;
  hasWarnedAboutMissingSink = false;
}

/**
 * Send an event.
 *
 * Dropped, in order of precedence, when: consent has not been granted, or no
 * provider is registered. In the first-drop case a single console warning is
 * emitted so that a silently-inert facade is obvious during development rather
 * than being mistaken for a broken integration.
 */
export function trackLandingEvent(event: LandingAnalyticsEvent): void {
  if (!consentGranted || !provider) {
    if (!hasWarnedAboutMissingSink) {
      hasWarnedAboutMissingSink = true;
      console.info(
        '[landing-page] analytics is inert: no consent and/or no provider registered. ' +
          'No data is being sent. This is expected until a consent mechanism and ' +
          'vendor are chosen.',
      );
    }
    return;
  }
  provider.send(event);
}

/** Test seam. Resets module state so tests do not leak into one another. */
export function resetAnalyticsForTesting() {
  provider = null;
  consentGranted = false;
  hasWarnedAboutMissingSink = false;
}
