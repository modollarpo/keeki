import {SectionHeading} from '@common/ui/landing-page/primitives/section-heading';
import {Accordion} from '@shadcn/accordion/accordion';
import {LinkButton} from '@shadcn/button/button';
import {Card} from '@shadcn/card/card';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {LucideIcon} from 'lucide-react';
import {cloneElement, Fragment, isValidElement, ReactNode} from 'react';
import {Link} from 'react-router';
import {CompanySection} from './company-page-layout';
import {getCompanyNavGroups} from './company-site-map';

/* -------------------------------------------------------------------------- */
/*  Band                                                                      */
/* -------------------------------------------------------------------------- */

type SectionBackground = 'default' | 'muted' | 'panel' | 'elevated';

const backgroundClasses: Record<SectionBackground, string> = {
  default: '',
  muted: 'bg-muted/40 dark:bg-card',
  elevated: 'bg-card/60 dark:bg-muted/20',
  panel: 'border-y border-border bg-muted/40 dark:bg-card',
};

export type CompanySectionProps = {
  title?: string;
  description?: string;
  badge?: string;
  align?: 'center' | 'left';
  background?: SectionBackground;
  /** Adds the entrance animation used by the hero. */
  animate?: boolean;
  /** Constrains the content column for prose-heavy pages. */
  narrow?: boolean;
  id?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * One band of a company page. Every page in this folder is a stack of these, so
 * the vertical rhythm, container width and heading type scale stay identical
 * across twenty-odd very different pages.
 */
export function CompanySectionBlock({
  title,
  description,
  badge,
  align = 'center',
  background = 'default',
  animate,
  narrow,
  id,
  className,
  children,
}: CompanySectionProps) {
  return (
    <section
      id={id}
      className={cn(
        CompanySection.band,
        backgroundClasses[background],
        animate && 'keekii-enter',
        className,
      )}
    >
      <div className={CompanySection.container}>
        {title || description || badge ? (
          <SectionHeading
            badge={badge}
            title={title}
            description={description}
            align={align}
            className={narrow ? 'max-w-2xl' : undefined}
          />
        ) : null}
        {children ? (
          <div
            className={cn(
              title || description || badge ? 'mt-12 sm:mt-16' : undefined,
              narrow ? 'mx-auto max-w-3xl' : undefined,
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Prose                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Long-form copy block. Tuned for the reading measure these pages need --
 * policy-ish pages and job descriptions -- rather than the short paragraphs the
 * marketing sections use.
 */
/**
 * Wraps bare text inside the prose tree in `Trans`.
 *
 * `CompanyProse` takes the page copy as ordinary JSX children -- paragraphs,
 * headings, lists, inline links. Repeating `<Trans>` at every one of those
 * call sites is both noisy and easy to forget, and a missed wrapper means the
 * sentence is silently untranslatable. Walking the tree instead means new prose
 * is translatable the moment it is added, with no change to the page files.
 */
function transChildren(node: ReactNode, keyPrefix = ''): ReactNode {
  if (typeof node === 'string') {
    // JSX collapses the source newlines and indentation, so the string a
    // translator sees is the whitespace-normalised one. Normalising here keeps
    // the lookup key identical to what is actually rendered.
    const message = node.replace(/\s+/g, ' ').trim();

    return message ? <Trans message={message} /> : null;
  }

  if (typeof node === 'number') return node;

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <Fragment key={`${keyPrefix}-${index}`}>
        {transChildren(child, `${keyPrefix}-${index}`)}
      </Fragment>
    ));
  }

  if (isValidElement(node)) {
    const {children: elementChildren} = node.props as {children?: ReactNode};

    return cloneElement(node, undefined, transChildren(elementChildren));
  }

  return node;
}

export function CompanyProse({children, className}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'space-y-5 text-base leading-7 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:keekii-display [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:text-foreground [&_h2]:sm:text-3xl [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-2',
        className,
      )}
    >
      {transChildren(children)}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feature cards                                                             */
/* -------------------------------------------------------------------------- */

export type CompanyFeature = {
  icon?: LucideIcon;
  title: string;
  description: string;
  to?: string;
};

export function CompanyFeatureGrid({
  features,
  columns = 3,
  className,
}: {
  features: CompanyFeature[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={cn('grid gap-5 sm:gap-6', columnClass, className)}>
      {features.map(feature => (
        <CompanyFeatureCard key={feature.title} feature={feature} />
      ))}
    </div>
  );
}

export function CompanyFeatureCard({feature}: {feature: CompanyFeature}) {
  const Icon = feature.icon;
  const body = (
    <>
      {Icon ? (
        <span className="flex size-11 items-center justify-center rounded-card-sm bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      ) : null}
      <h3 className="mt-5 text-base font-semibold text-foreground">
        <Trans message={feature.title} />
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        <Trans message={feature.description} />
      </p>
      {feature.to ? (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <Trans message="Learn more" />
          <span aria-hidden="true">&rarr;</span>
        </span>
      ) : null}
    </>
  );

  if (feature.to) {
    return (
      <Card.Root className="h-full gap-0 p-6 transition-colors duration-(--keekii-dur-quick) hover:bg-accent/40">
        <Link to={feature.to} className="focus-visible:outline-none">
          {body}
        </Link>
      </Card.Root>
    );
  }

  return (
    <Card.Root className="h-full gap-0 p-6">
      <div>{body}</div>
    </Card.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*  Numbered steps                                                            */
/* -------------------------------------------------------------------------- */

export function CompanySteps({
  steps,
  className,
}: {
  steps: {title: string; description: string}[];
  className?: string;
}) {
  return (
    <ol className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {steps.map((step, index) => (
        <li key={step.title} className="relative">
          <span className="keekii-display flex size-10 items-center justify-center rounded-card-sm bg-primary text-lg text-primary-foreground">
            {index + 1}
          </span>
          <h3 className="mt-5 text-base font-semibold text-foreground">
            <Trans message={step.title} />
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            <Trans message={step.description} />
          </p>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stats                                                                     */
/* -------------------------------------------------------------------------- */

export function CompanyStats({
  stats,
  className,
}: {
  stats: {value: string; label: string}[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        'grid gap-8 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {stats.map(stat => (
        <div key={stat.label} className="text-center">
          <dt className="sr-only">
            <Trans message={stat.label} />
          </dt>
          <dd>
            <span className="keekii-display block text-4xl text-foreground sm:text-5xl">
              <Trans message={stat.value} />
            </span>
            <span className="mt-3 block text-sm text-muted-foreground">
              <Trans message={stat.label} />
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export function CompanyFaq({
  questions,
  className,
}: {
  questions: {question: string; answer: string}[];
  className?: string;
}) {
  if (!questions.length) return null;
  return (
    <Accordion
      variant="separated"
      className={cn('mx-auto w-full max-w-3xl', className)}
    >
      {questions.map((item, index) => (
        <Accordion.Item key={item.question} value={`${index}`}>
          <Accordion.Trigger className="p-5 text-base font-medium">
            <Trans message={item.question} />
          </Accordion.Trigger>
          <Accordion.Content className="p-5 text-base/7 text-muted-foreground">
            <Trans message={item.answer} />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

/* -------------------------------------------------------------------------- */
/*  Callout / quote                                                           */
/* -------------------------------------------------------------------------- */

export function CompanyCallout({
  title,
  children,
  tone = 'default',
  className,
}: {
  title?: string;
  children: ReactNode;
  tone?: 'default' | 'primary';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-card border p-7 sm:p-9',
        tone === 'primary'
          ? 'border-primary/25 bg-primary/5'
          : 'border-border bg-muted/40 dark:bg-card',
        className,
      )}
    >
      {title ? (
        <h3
          className={
            'keekii-display text-xl text-foreground sm:text-2xl'
          }
        >
          <Trans message={title} />
        </h3>
      ) : null}
      <div
        className={cn(
          'text-base/7 text-muted-foreground',
          title && 'mt-4',
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA band                                                                  */
/* -------------------------------------------------------------------------- */

export type CompanyCtaAction = {label: string; to: string};

export function CompanyCtaBand({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: CompanyCtaAction[];
  className?: string;
}) {
  return (
    <section className={cn(CompanySection.band, className)}>
      <div className={CompanySection.container}>
        <div className="keekii-enter relative isolate overflow-hidden rounded-card border border-border bg-muted/40 px-6 py-14 text-center sm:px-12 dark:bg-card">
          <div
            aria-hidden="true"
            className="keekii-hero-wash absolute inset-0 -z-10 opacity-60"
          />
          <h2 className="keekii-display text-3xl text-balance sm:text-4xl">
            <Trans message={title} />
          </h2>
          {description ? (
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
              <Trans message={description} />
            </p>
          ) : null}
          {actions?.length ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Link columns -- the "Company / Useful links" nav                          */
/* -------------------------------------------------------------------------- */

/**
 * The in-page equivalent of the footer columns. Every company page ends with
 * this, so no page on the site is ever a dead end.
 */
export function CompanyLinkColumns({currentPath}: {currentPath: string}) {
  const groups = getCompanyNavGroups();

  return (
    <section className="border-t border-border/60 py-16 sm:py-20">
      <div className={CompanySection.container}>
        <h2 className="keekii-display text-2xl sm:text-3xl">
          <Trans message="More from Keekii" />
        </h2>

        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-sm/6 font-semibold tracking-widest text-muted-foreground uppercase">
                <Trans message={group.title} />
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.items.map(item => {
                  const isCurrent = item.to === currentPath;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={cn(
                          'text-sm transition-colors duration-(--keekii-dur-quick) hover:text-primary hover:underline',
                          isCurrent
                            ? 'font-medium text-primary'
                            : 'text-muted-foreground',
                        )}
                      >
                        <Trans message={item.label} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-10 max-w-3xl text-sm text-muted-foreground">
          <Trans message="Keekii is a product of Storegrill Inc Ltd, registered in England and Wales." />
        </p>
      </div>
    </section>
  );
}