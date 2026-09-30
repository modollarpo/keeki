import {StaticPageTitle} from '@common/seo/static-page-title';
import {Footer} from '@common/ui/footer/footer';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {LinkButton} from '@shadcn/button/button';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Trans} from '@ui/i18n/trans';
import {ReactNode} from 'react';
import {Helmet} from '@common/seo/helmet';
import {CompanyLinkColumns} from './company-page-sections';
import {getCompanySiteLink} from './company-site-map';

export type CompanyPageAction = {
  label: string;
  to: string;
};

export type CompanyPageLayoutProps = {
  /** Route of the current page, e.g. `/about`. Must exist in the site map. */
  path: string;
  /** Eyebrow above the h1. Defaults to the footer group the page belongs to. */
  eyebrow?: string;
  title: string;
  lead: string;
  actions?: CompanyPageAction[];
  /** Hides the "more from Keekii" link columns. */
  hideLinkColumns?: boolean;
  children: ReactNode;
};

/** Shared vertical rhythm and container. Every section on these pages uses it. */
export const CompanySection = {
  container: 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
  band: 'py-16 sm:py-20 lg:py-24',
};

/**
 * Shell for every public company page: sticky navbar, a brand hero that carries
 * the h1, and the shared footer.
 *
 * SEO tags come from the server (see `CompanyPageController`) rather than being
 * declared here, so the crawler prerender and the client-rendered page can never
 * disagree about a page's title or description. The site-map copy is only a
 * fallback for the case where the page is reached without server tags.
 */
export function CompanyPageLayout({
  path,
  eyebrow,
  title,
  lead,
  actions,
  hideLinkColumns,
  children,
}: CompanyPageLayoutProps) {
  const link = getCompanySiteLink(path);
  const seoTags = getBootstrapData().loaders?.companyPage?.seoTags;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {seoTags ? (
        <Helmet tags={seoTags} />
      ) : (
        <>
          <StaticPageTitle>
            <Trans message={link.label} />
          </StaticPageTitle>
          <Helmet>
            <meta name="description" content={link.description} />
            <meta property="og:description" content={link.description} />
            <meta property="og:title" content={link.label} />
            <meta name="twitter:title" content={link.label} />
            <meta name="twitter:description" content={link.description} />
          </Helmet>
        </>
      )}

      <Navbar.Root className="sticky top-0 z-10 border-b bg-background">
        <Navbar.Logo />
        <Navbar.Content className="ml-auto">
          <Navbar.AuthContent />
        </Navbar.Content>
      </Navbar.Root>

      <main className="flex-auto">
        <CompanyPageHero
          eyebrow={eyebrow ?? link.group}
          title={title}
          lead={lead}
          actions={actions}
        />
        {children}
        {hideLinkColumns ? null : (
          <CompanyLinkColumns currentPath={link.to} />
        )}
      </main>

      <Footer className="mx-3.5 md:mx-10" />
    </div>
  );
}

export type CompanyPageHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  actions?: CompanyPageAction[];
};

export function CompanyPageHero({
  eyebrow,
  title,
  lead,
  actions,
}: CompanyPageHeroProps) {
  return (
    <div className="relative isolate overflow-hidden border-b border-border/60">
      <div
        aria-hidden="true"
        className="keekii-hero-wash absolute inset-0 -z-10 opacity-70"
      />
      <div
        aria-hidden="true"
        className="keekii-rule-ember absolute inset-x-0 top-0 -z-10 h-px"
      />

      <div
        className={`${CompanySection.container} pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32`}
      >
        <div className="keekii-enter mx-auto max-w-3xl text-center">
          <p className="text-sm/6 font-semibold tracking-widest text-primary uppercase">
            <Trans message={eyebrow} />
          </p>
          <h1 className="keekii-display mt-4 text-4xl text-balance sm:text-5xl lg:text-6xl">
            <Trans message={title} />
          </h1>
          <p className="mt-6 text-lg leading-8 text-pretty text-muted-foreground sm:text-xl/9">
            <Trans message={lead} />
          </p>

          {actions?.length ? (
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {actions.map((action, index) => (
                <LinkButton
                  key={action.to}
                  to={action.to}
                  size="lg"
                  variant={index === 0 ? 'default' : 'outline'}
                  color={index === 0 ? 'primary' : 'default'}
                >
                  <Trans message={action.label} />
                </LinkButton>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}