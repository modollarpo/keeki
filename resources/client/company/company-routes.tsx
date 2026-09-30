import {RouteObject} from 'react-router';
import {getCompanySiteLinks} from './company-site-map';

/**
 * Every public marketing, plan and legal page, in one flat list.
 *
 * The site map is the source of truth for which pages exist, so this list is
 * checked against it at module load. Adding a page to `companySiteMap` without
 * adding a route here (or the reverse) throws immediately rather than
 * producing a 404 that nobody notices for a month.
 *
 * All of these are static paths, so they must stay ahead of `webPlayerRoutes` in
 * `app-router.tsx` -- React Router ranks static segments above dynamic ones, but
 * the ordering is explicit here so the intent is obvious.
 */
/** One entry per public page. `load` is the page's own lazy module. */
type CompanyPageRoute = {
  path: string;
  load: RouteObject['lazy'];
};

const pageRoutes: CompanyPageRoute[] = [
  // Company
  {path: '/about', load: () => import('./pages/about-page')},
  {path: '/jobs', load: () => import('./pages/jobs-page')},
  {path: '/for-the-record', load: () => import('./pages/for-the-record-page')},
  {path: '/communities', load: () => import('./pages/communities-page')},
  {path: '/artists', load: () => import('./pages/for-artists-page')},
  {path: '/creators', load: () => import('./pages/for-creators-page')},
  {path: '/authors', load: () => import('./pages/for-authors-page')},
  {path: '/developers', load: () => import('./pages/developers-page')},
  {path: '/advertising', load: () => import('./pages/advertising-page')},
  {path: '/investors', load: () => import('./pages/investors-page')},
  {path: '/vendors', load: () => import('./pages/vendors-page')},

  // Useful links
  {path: '/support', load: () => import('./pages/support-page')},
  {
    path: '/free-mobile-app',
    load: () => import('./pages/free-mobile-app-page'),
  },
  {
    path: '/popular-by-country',
    load: () => import('./pages/popular-by-country-page'),
  },
  {
    path: '/top-song-lyrics',
    load: () => import('./pages/top-song-lyrics-page'),
  },
  {
    path: '/import-your-music',
    load: () => import('./pages/import-your-music-page'),
  },

  // Plans
  {path: '/plans', load: () => import('./plans/plans-page')},
  {
    path: '/plans/premium-individual',
    load: () => import('./plans/premium-individual-page'),
  },
  {
    path: '/plans/premium-duo',
    load: () => import('./plans/premium-duo-page'),
  },
  {
    path: '/plans/premium-family',
    load: () => import('./plans/premium-family-page'),
  },
  {
    path: '/plans/premium-student',
    load: () => import('./plans/premium-student-page'),
  },
  {
    path: '/plans/keekii-free',
    load: () => import('./plans/keekii-free-page'),
  },

  // Legal
  {path: '/legal', load: () => import('./pages/legal-page')},
  {
    path: '/privacy-policy',
    load: () => import('./pages/privacy-policy-page'),
  },
  {path: '/cookies', load: () => import('./pages/cookies-page')},
  {path: '/about-ads', load: () => import('./pages/about-ads-page')},
  {path: '/accessibility', load: () => import('./pages/accessibility-page')},
  {path: '/gdpr', load: () => import('./pages/gdpr-page')},
];

function assertRoutesMatchSiteMap() {
  const mapped = new Set(getCompanySiteLinks().map(link => link.to));
  const routed = new Set(pageRoutes.map(route => route.path));

  const missingRoutes = [...mapped].filter(path => !routed.has(path));
  const missingEntries = [...routed].filter(path => !mapped.has(path));

  if (missingRoutes.length || missingEntries.length) {
    const lines = [
      '[keekii] companyRoutes and companySiteMap are out of sync.',
      missingRoutes.length
        ? `  No route for: ${missingRoutes.join(', ')}`
        : '',
      missingEntries.length
        ? `  Route with no site-map entry: ${missingEntries.join(', ')}`
        : '',
    ].filter(Boolean);

    throw new Error(lines.join('\n'));
  }
}

assertRoutesMatchSiteMap();

export const companyRoutes: RouteObject[] = pageRoutes.map(route => ({
  path: route.path.replace(/^\//, ''),
  lazy: route.load,
}));
