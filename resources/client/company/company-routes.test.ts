/// <reference types="node" />
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {companyRoutes} from './company-routes';
import {companySiteMap, getCompanySiteLinks} from './company-site-map';

const seoFile = readFileSync(
  resolve(process.cwd(), 'app/Support/CompanyPageSeo.php'),
  'utf8',
);

/** Path keys of the `all()` map in CompanyPageSeo, ie `'about' => [`. */
const phpPaths = [
  ...seoFile.matchAll(/^\s{12}'(\/[^']*)' => \[$/gm),
].map(match => match[1]);

describe('public page routing', () => {
  it('exposes every site-map page as a route', () => {
    const routed = companyRoutes.map(route => `/${route.path}`);

    expect(routed).toEqual(getCompanySiteLinks().map(link => link.to));
  });

  it('gives every page a unique path', () => {
    const paths = companyRoutes.map(route => route.path);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('loads a page component for every route', () => {
    for (const route of companyRoutes) {
      expect(route.lazy, `missing loader for ${route.path}`).toBeTypeOf(
        'function',
      );
    }
  });

  /**
   * The server renders the same pages from PHP. If a path exists on one side
   * only, the visitor gets a 200 from the fallback route with no title, no
   * description and no canonical link, so the two lists are asserted equal.
   */
  it('matches the server-side SEO map', () => {
    expect(phpPaths).toEqual(
      companySiteMap.flatMap(group =>
        group.items.map(item => item.to),
      ),
    );
  });
});
