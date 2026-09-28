import {readSectionChannelId} from '@common/ui/landing-page/landing-page-config';
import {
  normalizeSection,
  normalizeSections,
} from '@common/ui/landing-page/normalize/normalize-sections';
import {describe, expect, it} from 'vitest';

/**
 * The normalizer is the one piece of the landing page that must never regress
 * quietly: it is the only thing standing between whatever is stored in the
 * database (written by any admin, at any time, possibly by an older version of
 * the app) and a render tree. A crash here takes down the whole page.
 */
describe('normalizeSection', () => {
  it('rejects a non-object', () => {
    expect(normalizeSection(null, 0).name).toBe('footer');
    expect(normalizeSection('nonsense', 0).name).toBe('footer');
    expect(normalizeSection(42, 0).name).toBe('footer');
  });

  it('rejects a record without a string name', () => {
    expect(normalizeSection({}, 0).name).toBe('footer');
    expect(normalizeSection({name: 7}, 0).name).toBe('footer');
  });

  it('keeps a known section name', () => {
    expect(normalizeSection({name: 'faq'}, 0).name).toBe('faq');
  });

  /**
   * App-registered sections are not in the shared registry, so they arrive
   * here as plain records. They must survive normalisation rather than being
   * silently swapped for the fallback, or every custom section disappears.
   *
   * Asserted through `readSectionChannelId` — the accessor the app renderer
   * actually uses — rather than by reaching into the union, which cannot be
   * property-accessed directly without a cast.
   */
  it('preserves an unknown, app-registered section and its app-specific fields', () => {
    const config = normalizeSection(
      {name: 'channel', channelId: 12, someCustomFlag: true},
      0,
    );

    expect(config.name).toBe('channel');
    expect(readSectionChannelId(config)).toBe(12);
    // Asserted by key presence: the field is not part of any union member, which
    // is exactly the point being tested.
    expect(Object.keys(config)).toContain('someCustomFlag');
  });

  it('rejects an invalid background rather than trusting stored input', () => {
    const config = normalizeSection(
      {name: 'faq', background: 'not-a-real-background'},
      0,
    );

    expect(config.background).not.toBe('not-a-real-background');
  });

  it('rejects an invalid spacing rather than trusting stored input', () => {
    const config = normalizeSection({name: 'faq', spacing: 'huge'}, 0);

    expect(config.spacing).not.toBe('huge');
  });

  it('keeps a valid background and spacing', () => {
    const config = normalizeSection(
      {name: 'faq', background: 'muted', spacing: 'spacious'},
      0,
    );

    expect(config.background).toBe('muted');
    expect(config.spacing).toBe('spacious');
  });

  /**
   * Documented legacy quirk: `cta-simple-centered` has shipped with `buttons`
   * stored as a single object rather than an array. Coercing it here is what
   * stops that section throwing on render.
   */
  it('coerces a single button object into an array for cta-simple-centered', () => {
    const config = normalizeSection(
      {name: 'cta-simple-centered', buttons: {text: 'Go', url: '/x'}},
      0,
    ) as {buttons?: unknown};

    expect(Array.isArray(config.buttons)).toBe(true);
    expect(config.buttons).toHaveLength(1);
  });
});

describe('normalizeSections', () => {
  it('returns an empty list for a non-array', () => {
    expect(normalizeSections(null)).toEqual([]);
    expect(normalizeSections(undefined)).toEqual([]);
    expect(normalizeSections({})).toEqual([]);
  });

  it('normalises every entry', () => {
    expect(normalizeSections([{name: 'faq'}, {name: 'pricing'}]).map(s => s.name)).toEqual(
      ['faq', 'pricing'],
    );
  });

  /**
   * A single malformed section must not take the page down. The fallback keeps
   * its index so admin reordering and the hero-ad slot index stay aligned.
   */
  it('replaces a malformed entry with the fallback instead of dropping it', () => {
    const sections = normalizeSections([{name: 'faq'}, null, {name: 'pricing'}]);

    expect(sections).toHaveLength(3);
    expect(sections[0].name).toBe('faq');
    expect(sections[1].name).toBe('footer');
    expect(sections[2].name).toBe('pricing');
  });
});
