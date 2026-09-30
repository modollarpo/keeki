import {
  BarChart3Icon,
  BadgeCheckIcon,
  EyeIcon,
  GlobeIcon,
  HeadphonesIcon,
  MousePointerClickIcon,
  PlayIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFaq,
  CompanyFeatureGrid,
  CompanyProse,
  CompanySectionBlock,
  CompanyStats,
} from '../company-page-sections';
import {Trans} from '@ui/i18n/trans';

const formats = [
  {
    icon: PlayIcon,
    title: 'Audio',
    description:
      'Skippable and non-skippable spots across the free experience, between tracks and at the start of a session.',
  },
  {
    icon: EyeIcon,
    title: 'Display',
    description:
      'Above and below the player and alongside channel content, with standard sizes and responsive units.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Video',
    description:
      'Pre-roll and mid-roll video across the app and on the web, with sound-off viewing handled properly.',
  },
];

export function Component() {
  return (
    <CompanyPageLayout
      path="/advertising"
      title="Reach people who are actually listening"
      lead="Keekii advertising reaches a real audience of music listeners across fifteen markets -- on Keekii Free, where listeners are opted in to ads, and never inside a Premium session."
      actions={[
        {label: 'Request media pack', to: '/contact'},
        {label: 'Read the commitments', to: '/for-the-record'},
      ]}
    >
      <CompanySectionBlock
        title="Why advertise on Keekii"
        description="An advertising surface worth buying is one where nobody feels duped. That constraint shapes everything below."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: UsersIcon,
              title: 'Opted-in audience',
              description:
                'Ads run on Keekii Free, where listeners have chosen a free plan and accepted ads. Nothing interrupts Premium.',
            },
            {
              icon: GlobeIcon,
              title: 'Fifteen markets',
              description:
                'Nigeria, Ghana, South Africa, the UK and Ireland, the US, Canada, Australia, India, Brazil, Germany, France, Spain, Japan and South Korea.',
            },
            {
              icon: MousePointerClickIcon,
              title: 'Attribution you can reconcile',
              description:
                'Reports show what was served, what was clicked and what was heard -- reconciled against your own analytics.',
            },
            {
              icon: BarChart3Icon,
              title: 'Reported honestly',
              description:
                'Viewability, completion and click-through are reported as measured. We do not sell reach we cannot evidence.',
            },
            {
              icon: ShieldCheckIcon,
              title: 'Brand-safe by construction',
              description:
                'Inventory sits beside music, not user-generated controversy. There is no comment thread to sit next to.',
            },
            {
              icon: BadgeCheckIcon,
              title: 'No pay-to-rank',
              description:
                'Buying advertising never changes search results, editorial playlists or country charts. Those are not for sale.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock background="muted">
        <CompanyStats
          stats={[
            {value: '15', label: 'Active markets'},
            {value: '0', label: 'Ads inside a Premium session'},
            {value: 'Free', label: 'Only surface ads run on'},
            {value: '0', label: 'Paid placements in search or charts'},
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Formats"
        description="Three formats, served inside the app and on the web."
      >
        <CompanyFeatureGrid columns={3} features={formats} />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How we buy and sell"
        align="left"
        narrow
      >
        <CompanyProse>
          <h2>
<Trans message="Getting a rate card" />
</h2>
          <p>

            <Trans message="Send a brief through the contact form with your markets, your formats and your flight dates. You will get a rate card and an availability sheet back. There is no minimum spend to get started, and there is no self-serve funnel." />

            </p>

          <h2>
<Trans message="Direct and programmatic" />
</h2>
          <p>

            <Trans message="Campaigns can be run direct with Keekii, or through one of the programmatic partners we work with. Direct buys give you category exclusivity and placement control; programmatic buys give you targeting and pacing at volume. Most advertisers start direct." />

            </p>

          <h2>
<Trans message="Targeting" />
</h2>
          <p>

            <Trans message="Targeting is available by market, by language, by age bracket and by genre affinity. It is deliberately coarse. We do not build individual listener profiles to sell against, so there is no &quot;listener who plays this, buys this and lives here&quot; segment to buy." />

            </p>

          <h2>
<Trans message="Reporting" />
</h2>
          <p>

            <Trans message="You get served, clicked, played and completed counts, plus viewability where it is measurable. Impressions are deduplicated. Figures reconcile against your own web analytics, and if they do not, we would rather know than argue about it." />

            </p>

          <h2>
<Trans message="Brand safety and review" />
</h2>
          <p>

            <Trans message="Campaigns are reviewed before they run. We will decline categories that conflict with the audience, and we will flag creative that needs work rather than letting it through and hoping." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="The one thing advertising will not buy" tone="primary">
          <p>
            Advertising on Keekii buys attention. It does not buy placement in
            search, in editorial playlists, in country channels or in any chart.
            A paid placement there would make every chart on the service a
            commercial document, and we have decided not to have that.
          </p>
          <p>
            This is written down on For the Record, so that an advertiser who is
            told no has it in our own words.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="Practical questions from media buyers."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Is there a minimum spend?',
              answer:
                'No. Small direct campaigns are welcome, and the same contact route works for a test flight and for a year-long deal.',
            },
            {
              question: 'Can I target individual listeners?',
              answer:
                'No, and this is deliberate. Keekii does not build individual profiles for advertising, so targeting is by market, language, age bracket and genre only.',
            },
            {
              question: 'Do ads interrupt Premium users?',
              answer:
                'Never. Advertising runs on Keekii Free. A Premium session is ad-free by definition of the plan.',
            },
            {
              question: 'Can I run programmatic?',
              answer:
                'Yes, through our programmatic partners. Ask for the connection details in your first brief.',
            },
            {
              question: 'Which categories do you decline?',
              answer:
                'Anything whose brand would be unwelcome in the room. The full list is in the rate card, and we will tell you before you brief an agency.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Start with a brief"
        description="Tell us the markets, the formats and the dates. You will get a rate card and an availability sheet back."
        actions={[
          {label: 'Request media pack', to: '/contact'},
          {label: 'Read about Keekii', to: '/about'},
        ]}
      />
    </CompanyPageLayout>
  );
}
