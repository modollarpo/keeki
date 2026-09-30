import {
  BadgeCheckIcon,
  ChartNoAxesColumnIcon,
  FileMusicIcon,
  GlobeIcon,
  HandshakeIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react';
import {Link} from 'react-router';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFaq,
  CompanyFeatureGrid,
  CompanyProse,
  CompanySectionBlock,
  CompanySteps,
} from '../company-page-sections';
import {Trans} from '@ui/i18n/trans';

export function Component() {
  return (
    <CompanyPageLayout
      path="/artists"
      title="Your music, your rights, your numbers"
      lead="Upload to Keekii without a distributor, keep ownership of your recordings, and see exactly what every stream earned. This is the whole page -- there is nothing behind a sales call."
      actions={[
        {label: 'Import your music', to: '/import-your-music'},
        {label: 'Create a free account', to: '/register'},
      ]}
    >
      <CompanySectionBlock
        title="What Keekii gives an artist"
        description="Everything here is available to independent artists with no distributor and no label."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: FileMusicIcon,
              title: 'Upload without a distributor',
              description:
                'Put your own music on Keekii directly. No aggregator, no catalogue minimum, no approval committee.',
            },
            {
              icon: WalletIcon,
              title: 'You keep the rights',
              description:
                'You own your recordings and compositions. Keekii takes a licence, and you can withdraw it at any time.',
            },
            {
              icon: ChartNoAxesColumnIcon,
              title: 'Per-track play counts',
              description:
                'See which track is being played, in which country, and what that is worth -- not one monthly total.',
            },
            {
              icon: GlobeIcon,
              title: 'A country channel',
              description:
                'Set your country on your profile and your music reaches that market\'s channel, ordered by real plays.',
            },
            {
              icon: BadgeCheckIcon,
              title: 'Verified artist profiles',
              description:
                'Verification confirms who you are. It is not bought, and it is not a ranking boost.',
            },
            {
              icon: ShieldCheckIcon,
              title: 'Takedown you can actually use',
              description:
                'Withdraw a release and it comes down. We do not require you to out-litigate us to remove your own work.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How to get your music on Keekii"
        description="Three routes in. Pick whichever matches where your catalogue already is."
        align="left"
        narrow
      >
        <CompanySteps
          steps={[
            {
              title: 'Upload it yourself',
              description:
                'Create an artist profile, then upload tracks, albums and artwork from your account. Fastest route, and you keep every decision.',
            },
            {
              title: 'Send us your catalogue',
              description:
                'Already independent and outside a distributor? Send the files and metadata to artist support and we will build the profile with you.',
            },
            {
              title: 'Go through your distributor',
              description:
                'If you are with a label or distributor already, ask them to deliver to Keekii. Nothing about your existing deals changes.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What you will see"
        description="The artist tools, in the order you will use them."
        background="muted"
      >
        <CompanyFeatureGrid
          columns={2}
          features={[
            {
              icon: ChartNoAxesColumnIcon,
              title: 'Your insights, per track',
              description:
                'Plays, listeners and revenue broken down by track, album and market, with a date range you choose.',
            },
            {
              icon: ReceiptIcon,
              title: 'Statements you can reconcile',
              description:
                'A period statement per track. If a figure does not match what you expected, artist support will walk the workings through with you.',
            },
            {
              icon: UsersIcon,
              title: 'Who is listening',
              description:
                'Saves, playlist adds and reposts, so you can see what people do with a track rather than only that they pressed play.',
            },
            {
              icon: HandshakeIcon,
              title: 'A page you control',
              description:
                'Bio, imagery, links, credits and your country. All editable by you, without a support ticket.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How money works"
        align="left"
        narrow
        background="elevated"
      >
        <CompanyProse>
          <h2>
<Trans message="Where the money comes from" />
</h2>
          <p>

            <Trans message="Keekii earns in two ways: Premium subscriptions from listeners, and advertising on Keekii Free. Artist revenue is drawn from a share of that, and the share is not a secret -- it is in your agreement, and we will explain it if you ask." />

            </p>

          <h2>
<Trans message="How you get paid" />
</h2>
          <p>

            <Trans message="Royalties are reported per track per period. You can see the calculation rather than a headline number, and you can export it. Payment runs on a stated schedule with a defined reporting period, so you always know when money is coming and what it covers." />

            </p>

          <h2>
<Trans message="What is not deducted" />
</h2>
          <p>

            <Trans message="Nothing is deducted from artist revenue to pay for a subscription tier. Premium is what listeners pay for an ad-free experience, not a thing they buy in order to fund your royalties." />

            </p>

          <h2>
<Trans message="Reporting we will not give you" />
</h2>
          <p>

            <Trans message="We do not sell, share or license your listener data to third parties for targeting, and we do not build advertising segments out of your audience. Advertising is sold against the platform, not against you." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow>
        <CompanyCallout title="The commitment behind this page" tone="primary">
          <p>
            Every commitment on this page is written out in full on{' '}
            <Link to="/for-the-record" className="underline underline-offset-4">
              For the Record
            </Link>
            , including the parts that are uncomfortable for us. If something we
            have said here is not being done, artist support will tell you
            straight.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="The questions independent artists actually ask."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Do I need a distributor?',
              answer:
                'No. Upload your own music directly from your account, or send the files to artist support if the catalogue is large.',
            },
            {
              question: 'Can I upload music that is already on another service?',
              answer:
                'Yes, if you hold the rights. Being on another service does not stop you also being on Keekii.',
            },
            {
              question: 'What happens to my music if I leave?',
              answer:
                'You can withdraw it at any time and it comes down. We do not hold your catalogue to keep you on the service.',
            },
            {
              question: 'How long does review take?',
              answer:
                'A few days for a single release. Larger catalogues take longer, and artist support will tell you where yours is up to.',
            },
            {
              question: 'Does verification change my ranking?',
              answer:
                'Verification confirms identity. It is not a ranking signal and it is not for sale.',
            },
            {
              question: 'Can I claim writing credits?',
              answer:
                'Yes, through the writers and credits system. See the For Authors page for how that works.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Put something up today"
        description="You do not need a distributor, an audience or a business plan. You need a release."
        actions={[
          {label: 'Import your music', to: '/import-your-music'},
          {label: 'Create a free account', to: '/register'},
        ]}
      />
    </CompanyPageLayout>
  );
}
