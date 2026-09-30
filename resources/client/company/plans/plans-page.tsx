import {Trans} from '@ui/i18n/trans';
import {Link} from 'react-router';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCtaBand,
  CompanyFaq,
  CompanySectionBlock,
} from '../company-page-sections';
import {PlanComparisonTable, PlanCardGrid} from './plan-components';
import {plans} from './plan-data';

export function Component() {
  return (
    <CompanyPageLayout
      path="/plans"
      eyebrow="Useful links"
      title="Keekii Plans"
      lead="Five plans, one catalogue. Start on Keekii Free and move up whenever you want, or never -- the music is all there either way."
      actions={[
        {label: 'See current pricing', to: '/pricing'},
        {label: 'Create a free account', to: '/register'},
      ]}
    >
      <CompanySectionBlock
        title="Pick the one that fits"
        description="Keekii Free is a permanent plan, not a trial. Premium Individual is what most people choose. Duo, Family and Student exist for households and for people who are still at university."
      >
        <PlanCardGrid />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Compare every plan"
        description="The same catalogue on all five. What changes is how much of it you can take with you."
        background="muted"
      >
        <PlanComparisonTable />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How Keekii plans work"
        align="left"
        narrow
      >
        <div className="space-y-5 text-base leading-7 text-muted-foreground">
          <p>
            Every plan draws on the same catalogue. There is no smaller Keekii and
            no version of the catalogue you have to unlock -- Free plays the same
            tracks, the same albums and the same artists as Premium.
          </p>
          <p>
            What differs is what happens to your listening. Advertising, audio
            quality, offline downloads, how many accounts the plan covers and
            whether you can use an account away from home.
          </p>
          <p>
            Plans are billed monthly or annually and can be changed or cancelled
            from your account settings. Changing plan keeps your library, your
            playlists and the artists you follow.
          </p>
        </div>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="The questions people ask most often about Keekii plans."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Can I change plan later?',
              answer:
                'Yes, in either direction, at any time. Change plan from account settings and Keekii applies the remaining balance to the new plan.',
            },
            {
              question: 'What happens to my music if I cancel?',
              answer:
                'Nothing is deleted. Your library, playlists, follows and listening history stay on your account and come straight back if you resubscribe.',
            },
            {
              question: 'Is there a free trial?',
              answer:
                'There is no trial, because Keekii Free already is the free version. You can stay on it indefinitely.',
            },
            {
              question: 'Where do I see the price I will actually pay?',
              answer:
                'On the pricing page, which reads the plans Keekii is currently selling, including any offers running at the moment.',
            },
            {
              question: 'Do you offer refunds?',
              answer:
                'Contact the support team within thirty days of a charge and they will look at it. We would rather sort it out than argue about it.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Not sure yet?"
        description="Read how each plan compares on the pages below, or ask the support team directly."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.slice(0, 3).map(plan => (
            <Link
              key={plan.slug}
              to={`/plans/${plan.slug}`}
              className="rounded-card border border-border bg-card p-6 transition-colors duration-(--keekii-dur-quick) hover:bg-accent/40"
            >
              <h3 className="text-base font-semibold text-foreground">
                <Trans message={plan.label} />
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <Trans message={plan.summary} />
              </p>
            </Link>
          ))}
        </div>
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Listening is free to start"
        description="Make an account, keep your library, and decide later whether Premium is worth it to you."
        actions={[
          {label: 'Create a free account', to: '/register'},
          {label: 'See current pricing', to: '/pricing'},
        ]}
      />
    </CompanyPageLayout>
  );
}