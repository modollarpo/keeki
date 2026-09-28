import {trackLandingEvent} from '@common/analytics/landing-analytics';
import type {NormalizedSection} from '@common/ui/landing-page/landing-page-config';
import {useEffect} from 'react';

/**
 * Fires `landing_section_viewed` once per section as it scrolls into view.
 *
 * Each section is reported at most once, on first intersection. Re-entering
 * the viewport does not re-fire, so a visitor bouncing around a long page does
 * not inflate section counts.
 *
 * Sections matching `^hero` are excluded: the hero is above the fold and visible
 * on arrival, so an intersection event measures scroll behaviour rather than
 * whether the section rendered at all. Use the hero's own events for that.
 */
export function useLandingSectionViews(sections: NormalizedSection[]) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    // `alreadyInDom` dedupes repeated names in the DOM (a section repeated via
    // the admin); `fired` prevents re-firing. These must be separate sets —
    // folding them together would suppress the first event too.
    const fired = new Set<string>();
    const alreadyInDom = new Set<string>();
    const observed: Element[] = [];

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          const section = entry.target.getAttribute('data-section-name');
          if (!section || fired.has(section)) {
            continue;
          }
          fired.add(section);
          observer.unobserve(entry.target);
          trackLandingEvent({name: 'landing_section_viewed', section});
        }
      },
      // `rootMargin` biased to the top half so a section counts as "viewed"
      // once it is genuinely readable, not the instant its edge clips in.
      {rootMargin: '0px 0px -50% 0px', threshold: 0},
    );

    for (const element of Array.from(document.querySelectorAll('[data-section-name]'))) {
      const name = element.getAttribute('data-section-name') ?? '';
      if (name.startsWith('hero') || alreadyInDom.has(name)) {
        continue;
      }
      alreadyInDom.add(name);
      observed.push(element);
    }

    for (const element of observed) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [sections]);
}
