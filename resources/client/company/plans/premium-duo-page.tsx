import {
  ArrowLeftRightIcon,
  LaptopIcon,
  UsersIcon,
} from 'lucide-react';
import {
  CompanyFeatureGrid,
  CompanySectionBlock,
  CompanySteps,
} from '../company-page-sections';
import {getPlan} from './plan-data';
import {PlanPageTemplate} from './plan-page-template';

export function Component() {
  const plan = getPlan('premium-duo');

  return (
    <PlanPageTemplate plan={plan}>
      <CompanySectionBlock
        title="Why not just share a login"
        description="Sharing a password appears cheaper. In practice it means shared recommendations, fights over the queue, and an account that can be closed out from under you by someone else."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: UsersIcon,
              title: 'Two real accounts',
              description:
                'Each of you has its own library, its own playlists and its own recommendations.',
            },
            {
              icon: LaptopIcon,
              title: 'Nobody logs you out',
              description:
                'A password change on your partner\'s account cannot reach your device and end your access.',
            },
            {
              icon: ArrowLeftRightIcon,
              title: 'One bill, not two',
              description:
                'Two Premium accounts on one payment, which is what makes it cheaper than two Individuals.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Setting it up"
        description="It takes about a minute, and you can do it from either of your accounts."
        background="muted"
      >
        <CompanySteps
          steps={[
            {
              title: 'Take the Duo plan',
              description:
                'Choose Keekii Premium Duo at checkout. Nothing else is needed up front.',
            },
            {
              title: 'Create the second account',
              description:
                'From your account settings, invite the other person. They set their own password and never see yours.',
            },
            {
              title: 'Add your libraries',
              description:
                'If you already had an Individual account, transfer it into the Duo address so you keep everything.',
            },
          ]}
        />
      </CompanySectionBlock>
    </PlanPageTemplate>
  );
}