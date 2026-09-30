import {GlobeIcon, HouseIcon, UserMinusIcon} from 'lucide-react';
import {
  CompanyFeatureGrid,
  CompanySectionBlock,
  CompanySteps,
} from '../company-page-sections';
import {getPlan} from './plan-data';
import {PlanPageTemplate} from './plan-page-template';

export function Component() {
  const plan = getPlan('premium-family');

  return (
    <PlanPageTemplate plan={plan}>
      <CompanySectionBlock
        title="How Family works"
        description="Six accounts, one address. One of them can travel with you; the rest stay home."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: HouseIcon,
              title: 'One address, six people',
              description:
                'Everyone in the household gets a real account with their own library, not a shared login.',
            },
            {
              icon: GlobeIcon,
              title: 'One account travels',
              description:
                'One slot can sign in and play anywhere in the world, which is the difference between Family and simply sharing.',
            },
            {
              icon: UserMinusIcon,
              title: 'Free a slot in seconds',
              description:
                'Someone moves out, you remove them from the address and the slot is available for whoever is next.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Adding and removing people"
        description="You manage the address from your own account settings."
        background="muted"
      >
        <CompanySteps
          steps={[
            {
              title: 'Take the Family plan',
              description:
                'Choose Keekii Premium Family at checkout. Your address will be the one you are registered at.',
            },
            {
              title: 'Invite your household',
              description:
                'Send an invitation to each person. They create their own account and choose their own password.',
            },
            {
              title: 'Move existing accounts in',
              description:
                'Individuals, Duos and older subscriptions can be transferred into the Family address without losing anything.',
            },
          ]}
        />
      </CompanySectionBlock>
    </PlanPageTemplate>
  );
}