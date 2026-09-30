import {Footer} from '@common/ui/footer/footer';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {Helmet} from '@common/seo/helmet';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {ReactNode} from 'react';
import {Link} from 'react-router';
import {
  CompanyPageHero,
  CompanySection,
} from './company-page-layout';
import {CompanyLinkColumns} from './company-page-sections';
import {getCompanySiteLink, getLegalNavLinks} from './company-site-map';

export type LegalPageLayoutProps = {
  /** Route of the current page. Must exist in the site map's Legal group. */
  path: string;
  title: string;
  lead: string;
  /** "Last updated" line shown under the lead. */
  updated?: string;
  children: ReactNode;
};

/**
 * Shell for the legal and policy pages.
 *
 * Same navbar, hero and footer as the marketing pages, but the body is a single
 * reading column with a sticky "on this page" rail, because these documents are
 * long, referential and get linked to directly by regulators, advertisers and
 * rights holders. Nothing here invents a legal position: the copy is written to
 * describe Keekii's actual behaviour and is expected to be reviewed by counsel
 * before launch.
 */
export function LegalPageLayout({
  path,
  title,
  lead,
  updated,
  children,
}: LegalPageLayoutProps) {
  const link = getCompanySiteLink(path);
  const seoTags = getBootstrapData().loaders?.companyPage?.seoTags;
  const navLinks = getLegalNavLinks();

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
          eyebrow="Legal"
          title={title}
          lead={lead}
        />

        <div className={`${CompanySection.container} py-16 sm:py-20`}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
            <LegalNav
              currentPath={link.to}
              links={navLinks.map(item => ({label: item.label, to: item.to}))}
            />

            <div className="min-w-0">
              {updated ? (
                <p className="mb-10 text-sm text-muted-foreground">
                  <Trans message="Last updated" />: {updated}
                </p>
              ) : null}
              {children}
            </div>
          </div>
        </div>

        <CompanyLinkColumns currentPath={link.to} />
      </main>

      <Footer className="mx-3.5 md:mx-10" />
    </div>
  );
}

function LegalNav({
  currentPath,
  links,
}: {
  currentPath: string;
  links: {label: string; to: string}[];
}) {
  return (
    <nav aria-label="Legal pages" className="lg:sticky lg:top-24 lg:self-start">
      <h2 className="text-sm/6 font-semibold tracking-widest text-muted-foreground uppercase">
        <Trans message="Legal & privacy" />
      </h2>
      <ul className="mt-4 space-y-2.5 border-l border-border">
        {links.map(item => {
          const isCurrent = item.to === currentPath;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  '-ml-px block border-l-2 py-1 pl-4 text-sm transition-colors duration-(--keekii-dur-quick) hover:text-primary',
                  isCurrent
                    ? 'border-primary font-medium text-primary'
                    : 'border-transparent text-muted-foreground',
                )}
              >
                <Trans message={item.label} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export type LegalSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

/** A numbered clause. `id` is the anchor other documents link to. */
export function LegalSection({id, title, children}: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 [&+section]:mt-14">
      <h2 className="keekii-display text-2xl text-foreground sm:text-3xl">
        <Trans message={title} />
      </h2>
      <div className="mt-5 space-y-5 text-base/7 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h3]:mt-7 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

/** A definition-style sub-clause used by the longer policies. */
export function LegalSubSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3>
        <Trans message={title} />
      </h3>
      {children}
    </div>
  );
}

/** Standing note that these documents describe product behaviour, not advice. */
export function LegalNote({children}: {children: ReactNode}) {
  return (
    <p className="rounded-card border border-border bg-muted/40 p-5 text-sm/6 text-muted-foreground dark:bg-card">
      {children}
    </p>
  );
}
