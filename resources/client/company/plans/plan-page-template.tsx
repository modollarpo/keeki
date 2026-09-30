import {ReactNode} from 'react';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCtaBand,
  CompanyFaq,
  CompanySectionBlock,
} from '../company-page-sections';
import {
  PlanBenefitList,
  PlanIdealForList,
  PlanSwitcher,
} from './plan-components';
import {PlanDefinition} from './plan-data';

type PlanPageTemplateProps = {
  plan: PlanDefinition;
  /** Extra bands specific to this plan, rendered between the FAQ and the CTA. */
  children?: ReactNode;
};

/**
 * Shared chrome for the five plan pages: hero, what you get, who it suits, FAQ,
 * cross-links to the other plans and the closing CTA.
 *
 * Individual plans pass their own extra bands through `children` rather than
 * forking the layout, so a new plan is a data entry plus, at most, one section.
 */
export function PlanPageTemplate({plan, children}: PlanPageTemplateProps) {
  return (
    <CompanyPageLayout
      path={`/plans/${plan.slug}`}
      eyebrow="Keekii Plans"
      title={plan.name}
      lead={plan.tagline}
      actions={[
        {label: 'See current pricing', to: '/pricing'},
        {label: 'Create a free account', to: '/register'},
      ]}
    >
      <CompanySectionBlock
        title="What you get"
        description={plan.summary}
        align="left"
      >
        <PlanBenefitList items={plan.benefits} />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Who it is for"
        description={`Keekii ${plan.label} is built for ${plan.audience.toLowerCase()}.`}
        background="muted"
      >
        <PlanIdealForList items={plan.idealFor} />
      </CompanySectionBlock>

      {children}

      <CompanySectionBlock
        title="Frequently asked questions"
        description={`Everything people ask about Keekii ${plan.label}.`}
        background="muted"
      >
        <CompanyFaq questions={plan.faq} />
      </CompanySectionBlock>

      <PlanSwitcher currentSlug={plan.slug} />

      <CompanyCtaBand
        title={`Start with Keekii ${plan.label}`}
        description="Create a free account first if you like. You can change or cancel your plan whenever you want."
        actions={[
          {label: 'See current pricing', to: '/pricing'},
          {label: 'Create a free account', to: '/register'},
        ]}
      />
    </CompanyPageLayout>
  );
}