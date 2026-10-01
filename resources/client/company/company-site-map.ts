/**
 * Canonical site map for Keekii's public marketing pages.
 *
 * This is the single source of truth for the footer columns, the "Company" /
 * "Useful links" navigation rendered at the bottom of every page in this folder,
 * and the related-links block used by the crawler prerender. The PHP side keeps
 * the matching SEO copy in `App\Support\CompanyPageSeo` -- slugs must stay in
 * sync with `routes/web.php` and `company-routes.tsx`.
 */

export type CompanySiteLink = {
  /** Footer label, also used as the nav label. */
  label: string;
  /** Route path. Doubles as the page slug. */
  to: string;
  /** One line used on link cards and by the prerender. */
  description: string;
};

export type CompanySiteGroup = {
  title: string;
  items: CompanySiteLink[];
};

export const companySiteMap: CompanySiteGroup[] = [
  {
    title: 'Company',
    items: [
      {
        label: 'About',
        to: '/about',
        description:
          'Keekii is a music platform from Storegrill Inc Ltd, registered in England and Wales.',
      },
      {
        label: 'Jobs',
        to: '/jobs',
        description:
          'Open roles across engineering, design, product and artist support.',
      },
      {
        label: 'For the Record',
        to: '/for-the-record',
        description:
          'What Keekii stands for, and the commitments behind every release.',
      },
      {
        label: 'Communities',
        to: '/communities',
        description:
          'The people, collectives and local scenes that shape the Keekii catalogue.',
      },
      {
        label: 'For Artists',
        to: '/artists',
        description:
          'Upload your music, keep your rights, and understand every stream you earn.',
      },
      {
        label: 'For Creators',
        to: '/creators',
        description:
          'Music for video, podcast, streams and social, cleared for commercial use.',
      },
      {
        label: 'For Authors',
        to: '/authors',
        description:
          'Lyrics, credits and writing royalties for the people behind the words.',
      },
      {
        label: 'Developers',
        to: '/developers',
        description:
          'REST API documentation, webhooks and the tools to build on Keekii.',
      },
      {
        label: 'Advertising',
        to: '/advertising',
        description:
          'Reach listeners with audio, display and video campaigns across Keekii.',
      },
      {
        label: 'Investors',
        to: '/investors',
        description:
          'Company information, governance and reporting for Keekii shareholders.',
      },
      {
        label: 'Vendors',
        to: '/vendors',
        description:
          'Working with Keekii as a label, distributor, agency or supplier.',
      },
    ],
  },
  {
    title: 'Useful links',
    items: [
      {
        label: 'Support',
        to: '/support',
        description:
          'Answers, troubleshooting and a direct route to the Keekii support team.',
      },
      {
        label: 'Free Mobile App',
        to: '/free-mobile-app',
        description:
          'Download the Keekii app for iOS and Android, free of charge.',
      },
      {
        label: 'Popular by Country',
        to: '/popular-by-country',
        description:
          'Top artists and tracks in every market where Keekii is available.',
      },
      {
        label: 'Top Song Lyrics',
        to: '/top-song-lyrics',
        description:
          'The most searched lyrics on Keekii, by song and by artist.',
      },
      {
        label: 'Import your music',
        to: '/import-your-music',
        description:
          'Bring your catalogue over from another service or from your own files.',
      },
      {
        label: 'Keekii Plans',
        to: '/plans',
        description:
          'Compare Keekii Free and every Premium plan before you subscribe.',
      },
      {
        label: 'Premium Individual',
        to: '/plans/premium-individual',
        description:
          'One account, ad-free listening, offline downloads and full quality.',
      },
      {
        label: 'Premium Duo',
        to: '/plans/premium-duo',
        description:
          'Two separate accounts on one bill, each with full Premium benefits.',
      },
      {
        label: 'Premium Family',
        to: '/plans/premium-family',
        description:
          'Up to six separate accounts, one of which can be used while travelling.',
      },
      {
        label: 'Premium Student',
        to: '/plans/premium-student',
        description:
          'Full Premium for verified students, at a reduced rate.',
      },
      {
        label: 'Keekii Free',
        to: '/plans/keekii-free',
        description:
          'Listen without a subscription and see what Premium adds.',
      },
    ],
  },
  {
    title: 'Legal',
    items: [
      {
        label: 'Safety & Privacy Center',
        to: '/legal',
        description:
          'The hub for how Keekii handles safety, privacy and your rights, in one place.',
      },
      {
        label: 'Privacy Policy',
        to: '/privacy-policy',
        description:
          'What personal data Keekii collects, why, how long it is kept and who it is shared with.',
      },
      {
        label: 'Cookies',
        to: '/cookies',
        description:
          'The cookies Keekii sets, what each one does, and how to control them.',
      },
      {
        label: 'About Ads',
        to: '/about-ads',
        description:
          'How advertising works on Keekii, why Free shows ads, and why Premium does not.',
      },
      {
        label: 'Accessibility',
        to: '/accessibility',
        description:
          'The accessibility standard Keekii targets and how to report a barrier.',
      },
      {
        label: 'GDPR',
        to: '/gdpr',
        description:
          'Your rights to access, correct, export and erase personal data under the GDPR.',
      },
      {
        label: 'Terms of Use',
        to: '/terms',
        description:
          'The agreement between you and Keekii: the service, acceptable use, liability and how to end it.',
      },
    ],
  },
];

export type CompanySiteLinkWithGroup = CompanySiteLink & {group: string};

const flatLinks: CompanySiteLinkWithGroup[] = companySiteMap.flatMap(group =>
  group.items.map((item): CompanySiteLinkWithGroup => ({
    ...item,
    group: group.title,
  })),
);

export function getCompanySiteLinks(): CompanySiteLinkWithGroup[] {
  return flatLinks;
}

export function getCompanySiteLink(path: string): CompanySiteLinkWithGroup {
  const link = flatLinks.find(item => item.to === path);
  if (!link) {
    throw new Error(
      `[keekii] Unknown company page "${path}". Add it to companySiteMap before referencing it.`,
    );
  }
  return link;
}

/** Groups for the in-page footer nav, minus the group the current page is in. */
export function getCompanyNavGroups(excludeGroup?: string): CompanySiteGroup[] {
  if (!excludeGroup) return companySiteMap;
  return companySiteMap.filter(group => group.title !== excludeGroup);
}

/** The Legal group only, used by the sticky rail on the policy pages. */
export function getLegalNavLinks(): CompanySiteLink[] {
  return (
    companySiteMap.find(group => group.title === 'Legal')?.items ?? []
  );
}