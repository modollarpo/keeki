import {
  BadgeCheckIcon,
  CalendarClockIcon,
  GraduationCapIcon,
} from 'lucide-react';
import {
  CompanyFeatureGrid,
  CompanySectionBlock,
  CompanySteps,
} from '../company-page-sections';
import {getPlan} from './plan-data';
import {PlanPageTemplate} from './plan-page-template';

export function Component() {
  const plan = getPlan('premium-student');

  return (
    <PlanPageTemplate plan={plan}>
      <CompanySectionBlock
        title="Student rate, properly checked"
        description="The discount is real and so is the check. Keekii verifies eligibility once a year, which is the only part anyone finds annoying."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: GraduationCapIcon,
              title: 'The same Premium, less of it per month',
              description:
                'Premium Student is not a cut-down plan. Everything in Premium Individual is included.',
            },
            {
              icon: BadgeCheckIcon,
              title: 'Verified once a year',
              description:
                'One check every twelve months, and we remind you before the rate expires rather than letting it lapse quietly.',
            },
            {
              icon: CalendarClockIcon,
              title: 'Move on when you finish',
              description:
                'When you graduate, the account goes to the standard Premium Individual rate with nothing else changing.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How verification works"
        description="Four steps, and you only do the first one once."
        background="muted"
      >
        <CompanySteps
          steps={[
            {
              title: 'Apply from your account',
              description:
                'Choose Premium Student at checkout and select student verification when prompted.',
            },
            {
              title: 'Prove your enrolment',
              description:
                'You will be taken to our verification partner and asked to confirm where you study. Only enrolment status is shared -- never your grades.',
            },
            {
              title: 'Get the student rate',
              description:
                'Verification usually completes straight away and the reduced rate applies to your subscription immediately.',
            },
            {
              title: 'Re-verify next year',
              description:
                'We will email you before your twelve months are up so nothing is lost if you forget.',
            },
          ]}
        />
      </CompanySectionBlock>
    </PlanPageTemplate>
  );
}