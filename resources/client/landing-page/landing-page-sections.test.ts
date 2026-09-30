/// <reference types="node" />
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {sectionDefsByKey} from '@common/ui/landing-page/section-defs';

/**
 * Guards the section dispatch contract in the common landing page.
 *
 * The dispatcher checks the shared registry first and only falls through to the
 * app's `sectionRenderers` map for names the registry does not know. So an app
 * renderer registered under a shared name is unreachable: it compiles, it is in
 * the map, and it never renders. That is not a type error, which is how
 * `KeekiiHero` stayed dead across the whole brand-refresh series of commits.
 *
 * These read the real source rather than importing the component, because
 * importing the landing page pulls in the full client graph.
 */

const landingPageFile = readFileSync(
  resolve(process.cwd(), 'resources/client/landing-page/landing-page.tsx'),
  'utf8',
);

const defaultSettingsFile = readFileSync(
  resolve(process.cwd(), 'resources/defaults/default-settings.php'),
  'utf8',
);

/** Keys of the `sectionRenderers` map, ie `'keekii-hero': KeekiiHero,`. */
const rendererKeys = [
  ...landingPageFile.matchAll(/^\s{2}'?([\w-]+)'?:\s*\w+,?$/gm),
].map(match => match[1]);

/**
 * Section names in the default landingPage config, read from inside the
 * landingPage entry only. Slicing to the next top-level setting keeps names
 * belonging to other settings out of the result, and dropping the entry's own
 * `'name' => 'landingPage'` key removes the wrapper itself.
 */
const landingPageStart = defaultSettingsFile.indexOf("'name' => 'landingPage'");
const landingPageBlock = defaultSettingsFile.slice(landingPageStart);
const configSectionNames = [
  ...landingPageBlock.matchAll(/'name'\s*=>\s*'([\w-]+)'/g),
]
  .map(match => match[1])
  .filter(name => name !== 'landingPage');

describe('landing page section dispatch', () => {
  it('finds the renderer map in source', () => {
    // Guards the regexes above against silently matching nothing, which would
    // make every assertion below vacuously pass.
    expect(rendererKeys.length).toBeGreaterThan(0);
    expect(configSectionNames.length).toBeGreaterThan(0);
  });

  it('never registers an app renderer under a shared section name', () => {
    const unreachable = rendererKeys.filter(key => key in sectionDefsByKey);

    expect(
      unreachable,
      `these renderers are dead code: the shared component wins for these ` +
        `names, so the app renderer is never called -> ${unreachable.join(', ')}`,
    ).toEqual([]);
  });

  it('gives every app-registered section a renderer', () => {
    const shared = new Set(Object.keys(sectionDefsByKey));
    const withoutRenderer = configSectionNames.filter(
      name => !shared.has(name) && !rendererKeys.includes(name),
    );

    expect(
      withoutRenderer,
      `these configured sections are not shared and have no app renderer, ` +
        `so they render null -> ${withoutRenderer.join(', ')}`,
    ).toEqual([]);
  });
});
