import {ArrowRightIcon, CircleAlertIcon, WalletIcon} from 'lucide-react';
import {Link} from 'react-router';
import {
  CompanyCallout,
  CompanyFaq,
  CompanyFeatureGrid,
  CompanySectionBlock,
} from '../company-page-sections';
import {getPlan} from './plan-data';
import {PlanPageTemplate} from './plan-page-template';

export function Component() {
  const plan = getPlan('keekii-free');

  return (
    <PlanPageTemplate plan={plan}>
      <CompanySectionBlock
        title="Free is a plan, not a countdown"
        description="There is no trial to expire. Keekii Free is a permanent subscription that costs nothing, and the catalogue on it is the whole catalogue."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: WalletIcon,
              title: 'No card, ever',
              description:
                'Nothing to enter, nothing to be charged, nothing that expires because you did not do anything.',
            },
            {
              icon: CircleAlertIcon,
              title: 'Advertising, honestly',
                description:
                'Free is ad-supported, which is the whole trade. It is the reason Free costs nothing.',
            },
            {
              icon: ArrowRightIcon,
              title: 'Upgrading takes one click',
              description:
                'Move to Premium whenever you like. Your library, playlists and followed artists come with you.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="When Free is the right answer"
        align="left"
        narrow
        background="muted"
      >
        <CompanyCallout tone="primary" title="You may never need Premium at all">
          <p>
            Free plays the same tracks, albums and artists as Premium. If you
            listen on a device with a good connection and do not mind
            advertising, Keekii Free is a perfectly good way to use Keekii --
            permanently.
          </p>
          <p>
            Premium exists for the things Free cannot do: downloads, the highest
            available audio quality, no advertising, and unlimited skips. If none
            of those matter to you, stay on Free.
          </p>
          <p>
            You can{' '}
            <Link to="/plans/premium-individual" className="underline underline-offset-4">
              read what Premium Individual adds
            </Link>{' '}
            and decide from there.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock title="Common questions about Free">
        <CompanyFaq
          questions={[
            {
              question: 'Will Keekii ever take Free away?',
              answer:
                'No. Free is how most people meet Keekii, and it will stay available. Premium is an upgrade, never a requirement.',
            },
            {
              question: 'How much advertising is there?',
              answer:
                'Enough to pay for the service, and not enough to stop you listening. It appears between tracks rather than over the top of them.',
            },
            {
              question: 'Can I use Keekii Free on a cast speaker?',
              answer:
                'Yes, as long as the speaker has a free Keekii session available.',
            },
          ]}
        />
      </CompanySectionBlock>
    </PlanPageTemplate>
  );
}