import {
  BarChart3Icon,
  FileCheckIcon,
  GlobeIcon,
  HandshakeIcon,
  MailIcon,
  ScrollTextIcon,
  TargetIcon,
  TrendingUpIcon,
} from 'lucide-react';
import {Link} from 'react-router';
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
      path="/investors"
      title="Building the music service for markets that were skipped"
      lead="Keekii is a product of Storegrill Inc Ltd, registered in England and Wales. We are building audio infrastructure for the countries the major streaming services treated as an afterthought -- and we are funded to keep going."
      actions={[
        {label: 'Contact investor relations', to: '/contact'},
        {label: 'Read about Keekii', to: '/about'},
      ]}
    >
      <CompanySectionBlock
        title="The opportunity"
        description="The music markets that grew fastest over the last decade are the ones with the least catalogue depth and the least local infrastructure."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: GlobeIcon,
              title: 'Fifteen markets, properly served',
              description:
                'Nigeria, Ghana, South Africa, the UK and Ireland, the US, Canada, Australia, India, Brazil, Germany, France, Spain, Japan and South Korea.',
            },
            {
              icon: TrendingUpIcon,
              title: 'Local catalogue, not local playlists',
              description:
                'A Nigerian artist should be findable by a listener in Lagos searching in English, Pidgin or Yoruba, not only through a hand-made list.',
            },
            {
              icon: TargetIcon,
              title: 'A freemium that pays for itself',
              description:
                'Ads on the free tier fund the service so price is not the barrier, which keeps the catalogue open rather than paywalled.',
            },
            {
              icon: BarChart3Icon,
              title: 'Data we can publish',
              description:
                'Transparent country and genre charts, because a chart people trust is an asset and a chart nobody trusts is a liability.',
            },
            {
              icon: HandshakeIcon,
              title: 'Licensing done properly',
              description:
                'Direct deals where possible, aggregators and collection societies where not, tracked so rights never have to be guessed at.',
            },
            {
              icon: FileCheckIcon,
              title: 'Compliance that holds up',
              description:
                'Registered in England and Wales, with the data protection, tax and consumer rules of a regulated market treated as a floor.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What we have built"
        description="Where the business stands today."
        align="left"
        narrow
        background="muted"
      >
        <CompanyProse>
          <h2>
<Trans message="The product" />
</h2>
          <p>

            <Trans message="A cross-platform audio service -- web and mobile, built on a React front end and a Laravel back end -- with artist, album and track pages, a full player, a public API, a documented lyric system, and country and genre charts. The infrastructure is ours: media delivery, transcoding, rights metadata and reporting." />

            </p>

          <h2>
<Trans message="The catalogue" />
</h2>
          <p>

            <Trans message="A growing catalogue that is weighted towards markets the large services under-serve. Rights are tracked per release, which is the unglamorous part that turns out to be the whole difference between a service people trust and one they do not." />

            </p>

          <h2>
<Trans message="How it makes money" />
</h2>
          <p>

            <Trans message="Two lines. Premium subscriptions, which carry the recurring revenue and which are ad-free by definition. And advertising on Keekii Free, sold directly and programmatically, which is what keeps the free tier genuinely free and the catalogue open to everyone." />

            </p>

          <h2>
<Trans message="What we are deliberately not doing" />
</h2>
          <p>

            <Trans message="No paid placements in search, charts or editorial playlists. No data-broker profiles. No attention auctions sold to third parties. Each of those would be easy revenue and each would cost something we cannot buy back." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What we are looking for"
        description="Where capital and outside help would change the shape of the business."
      >
        <CompanyFeatureGrid
          columns={2}
          features={[
            {
              icon: GlobeIcon,
              title: 'Market entry partners',
              description:
                'Distribution, telco and payments relationships in markets where local knowledge is the whole game.',
            },
            {
              icon: ScrollTextIcon,
              title: 'Rights and licensing expertise',
              description:
                'To negotiate and maintain direct catalogue deals in territories we do not know as well as we should.',
            },
            {
              icon: TrendingUpIcon,
              title: 'Growth capital',
              description:
                'To accelerate market launches and invest in the parts of the stack we still build in-house.',
            },
            {
              icon: BarChart3Icon,
              title: 'Operator advice',
              description:
                'From people who have scaled a consumer audio subscription product across emerging markets.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="On disclosure" tone="primary">
          <p>
            We do not publish internal financial projections, and we will not
            circulate forecasts that are really sales material with a different
            label on them.
          </p>
          <p>
            What we will do is tell you what the business actually does, where it
            is weak, and what we would do with the money. If you are considering
            an investment, a serious conversation about the weaknesses is more
            useful than a flattering one.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Get in touch"
        description="Investor relations runs through the same contact form as everything else, and goes to a person."
        align="left"
        narrow
      >
        <CompanyProse>
          <p>
            Send a note through the{' '}
            <Link to="/contact" className="underline underline-offset-4">
              contact form
            </Link>{' '}
            with <strong>Investor relations</strong> in the subject line.
          </p>
          <p>

            <Trans message="We read everything. We will reply even when the answer is that we are not raising at the moment, because a no is still information and you have taken the time." />

            </p>
          <p>
            <MailIcon className="mr-1.5 inline size-4" />
            Keekii is a product of Storegrill Inc Ltd, registered in England and
            Wales. Company number and registered office details are available on
            request.
          </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Talk to us"
        description="Partnerships, capital, or a second opinion on the market. All three go to the same inbox."
        actions={[
          {label: 'Contact investor relations', to: '/contact'},
          {label: 'Read For the Record', to: '/for-the-record'},
        ]}
      />
    </CompanyPageLayout>
  );
}
