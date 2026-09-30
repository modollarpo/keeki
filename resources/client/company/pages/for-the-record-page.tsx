import {
  AccessibilityIcon,
  BookOpenCheckIcon,
  CoinsIcon,
  GlobeIcon,
  HandshakeIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFeatureGrid,
  CompanyProse,
  CompanySectionBlock,
} from '../company-page-sections';
import {Trans} from '@ui/i18n/trans';

export function Component() {
  return (
    <CompanyPageLayout
      path="/for-the-record"
      title="For the Record"
      lead="The commitments we hold Keekii to. This page is deliberately specific, so that holding us to it is possible."
      actions={[
        {label: 'Read about Keekii', to: '/about'},
        {label: 'For Artists', to: '/artists'},
      ]}
    >
      <CompanySectionBlock
        title="Why this page exists"
        align="left"
        narrow
      >
        <CompanyProse>
          <p>

            <Trans message="Every streaming service says it is built around artists and listeners. It is close to meaningless on its own, because the details are where the commitment actually lives." />

            </p>
          <p>

            <Trans message="So this page skips the values poster and lists the things Keekii does or does not do. If we break one of these, we would rather you told us than found out. If we need to change one, we will say why on this page rather than quietly changing it." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What Keekii commits to"
        description="Six commitments, each of which someone here is responsible for."
        background="muted"
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: HandshakeIcon,
              title: 'We license, we do not claim',
              description:
                'Artists and labels keep ownership of their recordings and compositions. Keekii takes a licence for the duration of the deal, and nothing more.',
            },
            {
              icon: CoinsIcon,
              title: 'Money is reported, not summarised',
              description:
                'Artists and writers see per-track play counts and per-period statements. We do not publish a single headline figure that we cannot show the workings for.',
            },
            {
              icon: BookOpenCheckIcon,
              title: 'Credits are correct and correctable',
              description:
                'Writers, producers and featured artists are credited on the release. Whoever is credited can correct their own entry without emailing support.',
            },
            {
              icon: GlobeIcon,
              title: 'Local music is a first-class citizen',
              description:
                'Every market in the catalogue gets a proper country channel. Non-English-language music is not a niche category on Keekii.',
            },
            {
              icon: ShieldCheckIcon,
              title: 'Takedown actually works',
              description:
                'If you are right that something should not be here, it comes down. We do not require you to out-litigate us.',
            },
            {
              icon: AccessibilityIcon,
              title: 'The service stays usable',
              description:
                'The player works with a keyboard, a screen reader and a bad connection. Paid features are not the ones that work best.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What Keekii will not do"
        description="The list is at least as important as the one above."
        align="left"
        narrow
      >
        <CompanyProse>
          <ul>
            <li>
              <strong>We will not sell your listening data.</strong> There is no
              data broker on our side of the business. Advertising is sold as
              advertising, on Keekii Free, without a profile of the individual
              behind the account.
            </li>
            <li>
              <strong>We will not bury a release because somebody paid.</strong>{' '}
              There is no pay-to-rank in search, no paid placement in editorial
              playlists, and no sponsored row in a country chart.
            </li>
            <li>
              <strong>We will not hold your catalogue hostage.</strong> If you
              ask to take your music down, it comes down. Keeping it up while a
              disagreement is resolved is a decision we make deliberately, and
              against us commercially.
            </li>
            <li>
              <strong>We will not take a track offline for a licence holder who
              simply dislikes it.</strong> Rights holders can object on rights
              grounds, and those get actioned.
            </li>
            <li>
              <strong>We will not make leaving difficult.</strong> Cancel in
              account settings, in a few clicks, without a retention flow. Your
              library stays on your account.
            </li>
            <li>
              <strong>We will not call a free tier a trial.</strong> Keekii Free
              is permanent and stays available.
            </li>
          </ul>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="The awkward parts"
        description="Where the business model genuinely pulls against these commitments."
        align="left"
        narrow
        background="elevated"
      >
        <CompanyProse>
          <h2>
<Trans message="Advertising underpins Free" />
</h2>
          <p>

            <Trans message="Keekii Free is funded by advertising, which is why Premium exists at all. That is a real trade: a listener on Free is supporting the service with their attention, and some people would rather not. The alternative -- charging everyone -- seemed worse." />

            </p>

          <h2>
<Trans message="Free downloads would cost the music" />
</h2>
          <p>

            <Trans message="Downloads only exist on Premium, and there are listeners who resent that. The counter-argument is that offline copies are how catalogues get walked away with, and the catalogue belongs to the people who made it. We are not claiming there is no cost here, only that we have chosen who bears it." />

            </p>

          <h2>
<Trans message="Recommendation is not neutral" />
</h2>
          <p>

            <Trans message="Anything that ranks music is making an argument about what people should hear. Ours is built from listening signals and catalogue relationships, which means it favours what has already been listened to. That is a limitation of every recommender, including ours." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow>
        <CompanyCallout title="If we break one of these" tone="primary">
          <p>
            Tell the support team what happened and which commitment it went
            against. Committed breaches get acknowledged on this page with what
            we changed, not privately resolved. If we disagree that we breached
            it, we will say so and explain why, and you will be free to disagree
            with us in public.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Check us on it"
        description="Every commitment above has a place where you can see whether Keekii is actually doing what it says."
        actions={[
          {label: 'For Artists', to: '/artists'},
          {label: 'For Authors', to: '/authors'},
          {label: 'Contact us', to: '/contact'},
        ]}
      />
    </CompanyPageLayout>
  );
}
