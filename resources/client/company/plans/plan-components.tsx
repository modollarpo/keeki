import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {CheckIcon, MinusIcon} from 'lucide-react';
import {ReactNode} from 'react';
import {Link} from 'react-router';
import {CompanySection} from '../company-page-layout';
import {PlanDefinition, plans} from './plan-data';

/* -------------------------------------------------------------------------- */
/*  Plan card                                                                 */
/* -------------------------------------------------------------------------- */

export function PlanCard({
  plan,
  className,
}: {
  plan: PlanDefinition;
  className?: string;
}) {
  const Icon = plan.icon;
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-card border p-7',
        plan.recommended
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-card-sm',
            plan.recommended
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="size-5" />
        </span>
        {plan.recommended ? (
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Trans message="Most popular" />
          </span>
        ) : null}
      </div>

      <h3 className="keekii-display mt-5 text-xl text-foreground">
        <Trans message={plan.name} />
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        <Trans message={plan.audience} />
      </p>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        <Trans message={plan.summary} />
      </p>

      <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
        {plan.included.map(item => (
          <li key={item} className="flex items-start gap-2.5">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <Trans message={item} />
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <Link
          to={`/plans/${plan.slug}`}
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          <Trans message="See what is included" />
        </Link>
      </div>
    </div>
  );
}

export function PlanCardGrid({className}: {className?: string}) {
  return (
    <div
      className={cn(
        'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {plans.map(plan => (
        <PlanCard key={plan.slug} plan={plan} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Comparison table                                                          */
/* -------------------------------------------------------------------------- */

type ComparisonValue = string | boolean;

type ComparisonRow = {
  label: string;
  /** Per plan, in `plans` order. `false` renders as a dash, `true` as a tick. */
  values: ComparisonValue[];
};

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Accounts included',
    values: ['1', '1', '2', 'Up to 6', '1'],
  },
  {
    label: 'Full catalogue',
    values: [true, true, true, true, true],
  },
  {
    label: 'Advertising',
    values: ['Yes', 'No', 'No', 'No', 'No'],
  },
  {
    label: 'Highest audio quality',
    values: [false, true, true, true, true],
  },
  {
    label: 'Offline downloads',
    values: [false, true, true, true, true],
  },
  {
    label: 'Unlimited skips',
    values: [false, true, true, true, true],
  },
  {
    label: 'Lyrics view',
    values: [true, true, true, true, true],
  },
  {
    label: 'Account usable while travelling',
    values: [false, true, true, true, true],
  },
  {
    label: 'Annual re-verification required',
    values: [false, false, false, false, true],
  },
];

export function PlanComparisonTable({className}: {className?: string}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 bg-background py-4 pr-4 font-semibold text-foreground"
            >
              <Trans message="What's included" />
            </th>
            {plans.map(plan => (
              <th
                key={plan.slug}
                scope="col"
                className="min-w-32 px-4 py-4 text-center"
              >
                <Link
                  to={`/plans/${plan.slug}`}
                  className={cn(
                    'font-semibold hover:underline',
                    plan.recommended ? 'text-primary' : 'text-foreground',
                  )}
                >
                  <Trans message={plan.label} />
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map(row => (
            <tr key={row.label} className="border-t border-border/70">
              <th
                scope="row"
                className="sticky left-0 bg-background py-4 pr-4 font-normal text-muted-foreground"
              >
                <Trans message={row.label} />
              </th>
              {row.values.map((value, index) => (
                <td
                  key={`${row.label}-${plans[index].slug}`}
                  className="px-4 py-4 text-center text-muted-foreground"
                >
                  <ComparisonCell value={value} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonCell({value}: {value: ComparisonValue}) {
  if (value === true) {
    return (
      <>
        <CheckIcon className="mx-auto size-4 text-primary" />
        <span className="sr-only">
          <Trans message="Included" />
        </span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <MinusIcon className="mx-auto size-4 text-muted-foreground/50" />
        <span className="sr-only">
          <Trans message="Not included" />
        </span>
      </>
    );
  }
  return <Trans message={value} />;
}

/* -------------------------------------------------------------------------- */
/*  Plan page pieces                                                          */
/* -------------------------------------------------------------------------- */

export function PlanBenefitList({items}: {items: string[]}) {
  return (
    <ul className="space-y-3.5">
      {items.map(item => (
        <li key={item} className="flex items-start gap-3">
          <CheckIcon className="mt-1 size-4 shrink-0 text-primary" />
          <span className="text-base/7 text-muted-foreground">
            <Trans message={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PlanIdealForList({items}: {items: string[]}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(item => (
        <div
          key={item}
          className="rounded-card-sm border border-border bg-card p-5"
        >
          <p className="text-sm leading-6 text-muted-foreground">
            <Trans message={item} />
          </p>
        </div>
      ))}
    </div>
  );
}

export function PlanIncludedList({items}: {items: string[]}) {
  return (
    <div className={CompanySection.container}>
      <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {items.map(item => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm/6 text-muted-foreground"
          >
            <CheckIcon className="mt-1 size-4 shrink-0 text-primary" />
            <span>
              <Trans message={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Cross-links to the other plans, used at the bottom of every plan page. */
export function PlanSwitcher({
  currentSlug,
  className,
}: {
  currentSlug: PlanDefinition['slug'];
  className?: string;
}) {
  const others = plans.filter(plan => plan.slug !== currentSlug);
  return (
    <section className={cn(CompanySection.band, className)}>
      <div className={CompanySection.container}>
        <h2 className="keekii-display text-2xl sm:text-3xl">
          <Trans message="Considering a different plan?" />
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {others.map(plan => {
            const Icon = plan.icon;
            return (
              <Link
                key={plan.slug}
                to={`/plans/${plan.slug}`}
                className="group rounded-card border border-border bg-card p-5 transition-colors duration-(--keekii-dur-quick) hover:bg-accent/40"
              >
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-foreground group-hover:text-primary">
                  <Trans message={plan.label} />
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  <Trans message={plan.audience} />
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Wrapper that keeps the "live pricing" note attached to every plan surface. */
export function LivePricingNote({children}: {children?: ReactNode}) {
  return (
    <div className="text-center text-sm text-muted-foreground">
      {children ?? (
        <Trans message="Live prices and checkout are on the Keekii Plans page." />
      )}
    </div>
  );
}