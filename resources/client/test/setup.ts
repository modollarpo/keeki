import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach, vi} from 'vitest';

/**
 * Shared test environment setup.
 *
 * `globals: false` in `vitest.config.ts` is deliberate: test files import
 * `describe`/`it`/`expect` explicitly. Relying on ambient globals would mean
 * adding `"types": ["vitest/globals"]` to the app's `tsconfig.json`, which would
 * then also apply to production code and mask a missing import as a silent
 * `undefined` reference.
 */

// RTL leaves rendered trees mounted between tests by default only when
// auto-cleanup is unavailable; doing it explicitly keeps this working
// regardless of how the environment is configured.
afterEach(() => {
  cleanup();
});

// jsdom implements neither of these, and both are used by the layout-affecting
// components under test. Stubbed rather than polyfilled so a test that depends
// on a specific value can still override it.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds: number[] = [];
  } as unknown as typeof IntersectionObserver;
}
