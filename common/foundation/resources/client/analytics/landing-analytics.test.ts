import {
  grantAnalyticsConsent,
  hasAnalyticsConsent,
  LandingAnalyticsEvent,
  LandingAnalyticsProvider,
  resetAnalyticsForTesting,
  setAnalyticsProvider,
  trackLandingEvent,
} from '@common/analytics/landing-analytics';
import {afterEach, beforeEach, describe, expect, it, Mock, vi} from 'vitest';

/**
 * These tests exist mostly to protect the *default*: analytics must be inert
 * until both a provider and explicit consent exist. A regression that makes the
 * facade send by default would not show up as a crash — it would quietly start
 * reporting on real visitors, so it needs a test to catch it.
 */
describe('landing analytics', () => {
  let send: Mock<(event: LandingAnalyticsEvent) => void>;

  beforeEach(() => {
    resetAnalyticsForTesting();
    // Typed against the real provider signature so the test cannot drift from
    // the contract it is asserting on.
    send = vi.fn<(event: LandingAnalyticsEvent) => void>();
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    resetAnalyticsForTesting();
  });

  describe('by default', () => {
    it('considers consent withheld', () => {
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('sends nothing even for a valid event', () => {
      trackLandingEvent({
        name: 'landing_section_viewed',
        section: 'faq',
      });

      expect(send).not.toHaveBeenCalled();
    });
  });

  /**
   * With consent granted but nothing registered, `send` is unreachable by
   * construction — asserting on it would pass even if the facade were broken.
   * The observable behaviour is the one-shot console notice, which exists
   * precisely so a silently inert facade is not mistaken for a working
   * integration. That is what gets asserted.
   */
  describe('with consent but no provider', () => {
    beforeEach(() => {
      grantAnalyticsConsent(true);
    });

    it('reports that analytics is inert', () => {
      trackLandingEvent({name: 'landing_section_viewed', section: 'faq'});

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('no consent and/or no provider registered'),
      );
    });

    it('does not throw', () => {
      expect(() =>
        trackLandingEvent({name: 'landing_section_viewed', section: 'faq'}),
      ).not.toThrow();
    });
  });

  describe('with a provider but no consent', () => {
    beforeEach(() => {
      setAnalyticsProvider({send} satisfies LandingAnalyticsProvider);
    });

    it('sends nothing', () => {
      trackLandingEvent({name: 'landing_section_viewed', section: 'faq'});

      expect(send).not.toHaveBeenCalled();
    });

    it('sends nothing even after consent is explicitly revoked', () => {
      grantAnalyticsConsent(false);

      trackLandingEvent({name: 'landing_section_viewed', section: 'faq'});

      expect(send).not.toHaveBeenCalled();
    });
  });

  describe('with a provider and consent', () => {
    beforeEach(() => {
      setAnalyticsProvider({send} satisfies LandingAnalyticsProvider);
      grantAnalyticsConsent(true);
    });

    it('forwards the event', () => {
      trackLandingEvent({name: 'landing_section_viewed', section: 'faq'});

      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith({
        name: 'landing_section_viewed',
        section: 'faq',
      });
    });

    it('stops sending once the provider is removed', () => {
      setAnalyticsProvider(null);

      trackLandingEvent({name: 'landing_section_viewed', section: 'faq'});

      expect(send).not.toHaveBeenCalled();
    });

    it('stops sending once consent is revoked', () => {
      grantAnalyticsConsent(false);

      trackLandingEvent({name: 'landing_section_viewed', section: 'faq'});

      expect(send).not.toHaveBeenCalled();
    });
  });
});
