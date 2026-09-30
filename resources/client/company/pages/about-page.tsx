import {Trans} from '@ui/i18n/trans';
import {
  BookOpenCheckIcon,
  Building2Icon,
  GlobeIcon,
  HeadphonesIcon,
  HeartHandshakeIcon,
  RadioIcon,
} from 'lucide-react';
import {Link} from 'react-router';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCtaBand,
  CompanyCallout,
  CompanyFeatureGrid,
  CompanyProse,
  CompanySectionBlock,
  CompanyStats,
  CompanySteps,
} from '../company-page-sections';

export function Component() {
  return (
    <CompanyPageLayout
      path="/about"
      title="Music should belong to the people who make it"
      lead="Keekii is a music platform built around a simple idea: the artists, the writers and the listeners who do the work should get the most out of it."
      actions={[
        {label: 'Create a free account', to: '/register'},
        {label: 'See current pricing', to: '/pricing'},
      ]}
    >
      <CompanySectionBlock
        title="What Keekii is"
        description="Keekii is a streaming service, a catalogue and a set of tools for the people who work in music. It is a product of Storegrill Inc Ltd, registered in England and Wales."
        align="left"
        narrow
      >
        <CompanyProse>
          <p>

            <Trans message="We built Keekii because the way music is streamed has settled into a pattern that suits almost nobody. Listeners pay monthly and get a catalogue they cannot take with them. Artists upload decades of work and see a figure that does not cover a single session. Writers, producers and the people who session on other people's records are largely invisible." />

            </p>
          <p>

            <Trans message="Keekii takes the opposite position. Streaming is the default, and downloads are part of Premium rather than an extra. Lyrics are first-class content, editable by the people who wrote them. Artist profiles are pages you can build on, not a search result. And every figure we can show an artist, we show them." />

            </p>
          <p>

            <Trans message="We are a small company. We are not trying to be the largest streaming service in the world; there are enough of those. We are trying to be the one that people in music would choose if the economics were fair." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock background="muted">
        <CompanyStats
          stats={[
            {value: 'Storegrill Inc Ltd', label: 'Registered in England and Wales'},
            {value: 'Every', label: 'Genre, country and generation in the catalogue'},
            {value: 'Lyrics', label: 'Editable by the people who wrote them'},
            {value: '0', label: 'Records deleted because an artist left'},
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What we are trying to build"
        description="Four commitments, written down so they can be held to."
      >
        <CompanyFeatureGrid
          columns={2}
          features={[
            {
              icon: HeadphonesIcon,
              title: 'Listening first',
              description:
                'No feature on Keekii gets in the way of the music. The player does one thing and it does it well.',
            },
            {
              icon: HeartHandshakeIcon,
              title: 'Artists keep their rights',
              description:
                'Your work is yours. We license it, we never claim it, and you can take it down the day you want.',
            },
            {
              icon: BookOpenCheckIcon,
              title: 'Credits are accurate',
              description:
                'Writers, producers and featured artists are credited where they belong and can correct their own details.',
            },
            {
              icon: GlobeIcon,
              title: 'Local music is not niche',
              description:
                'Every country in the catalogue gets a proper front door, not a search filter buried in settings.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How Keekii actually works"
        description="Nothing here is a secret, but it is not obvious either."
        background="muted"
      >
        <CompanySteps
          steps={[
            {
              title: 'Artists and labels publish',
              description:
                'Uploads go through Keekii or through a distributor. Metadata is checked and artwork is stored properly.',
            },
            {
              title: 'Everything lands in one catalogue',
              description:
                'Independent and major releases sit in the same search, the same playlists and the same country charts.',
            },
            {
              title: 'Listeners find it',
              description:
                'Search, channels, playlists, recommendations and country charts -- all drawing on the same catalogue.',
            },
            {
              title: 'People get paid',
              description:
                'Play counts, royalties and statements are visible to the people who earned them.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="The company"
        align="left"
        narrow
        background="elevated"
      >
        <CompanyProse>
          <h2>
<Trans message="Legal identity" />
</h2>
          <p>

            <Trans message="Keekii is a product of Storegrill Inc Ltd, registered in England and Wales. Keekii is a trading name used across the service, the mobile apps and this website." />

            </p>
          <p>

            <Trans message="Contracts for business customers, advertising, distribution and investment are entered into with Storegrill Inc Ltd. Consumer subscriptions are billed in the currency and under the terms shown at checkout." />

            </p>

          <h2>
<Trans message="Where we are" />
</h2>
          <p>

            <Trans message="Keekii is built and run remotely, with team members and contributors across the United Kingdom, Ireland, Nigeria, Ghana, South Africa, India, Brazil, Germany, France, Spain, Japan and South Korea. Keekii publishes country channels for each of those markets, and more." />

            </p>

          <h2>
<Trans message="Talk to us" />
</h2>
          <p>
            The fastest route to a human is the{' '}
            <Link to="/support" className="underline underline-offset-4">
              support team
            </Link>
            . For press, partnership or business enquiries, the{' '}
            <Link to="/contact" className="underline underline-offset-4">
              contact form
            </Link>{' '}
            reaches the same inbox with the right subject line. If you are trying
            to build on Keekii rather than with us, start at{' '}
            <Link to="/developers" className="underline underline-offset-4">
              developers
            </Link>
            .
          </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow>
        <CompanyCallout title="What Keekii is not" tone="primary">
          <p>
            Keekii is not a download store wearing a streaming hat, not a social
            network with music attached, and not a place where an upload can be
            buried indefinitely by somebody with a larger budget.
          </p>
          <p>
            We are aware that those are exactly the things a music platform tends
            to become. The{' '}
            <Link to="/for-the-record" className="underline underline-offset-4">
              For the Record
            </Link>{' '}
            page is where we write down what we will and will not do, so that
            holding us to it is possible.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Keekii for the people who use it"
        description="Most of what we do is built for someone specific."
        background="muted"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              to: '/artists',
              title: 'For Artists',
              icon: RadioIcon,
              description:
                'Upload your own music, keep your rights, and see what every stream earned.',
            },
            {
              to: '/authors',
              title: 'For Authors',
              icon: BookOpenCheckIcon,
              description:
                'Lyrics, writing credits and royalties for songwriters and the people behind the words.',
            },
            {
              to: '/creators',
              title: 'For Creators',
              icon: Building2Icon,
              description:
                'Cleared music for video, podcast, streaming and social.',
            },
            {
              to: '/communities',
              title: 'Communities',
              icon: GlobeIcon,
              description:
                'The scenes, collectives and country channels that shape the catalogue.',
            },
            {
              to: '/jobs',
              title: 'Jobs',
              icon: HeadphonesIcon,
              description:
                'Open roles across engineering, product, design and artist support.',
            },
            {
              to: '/investors',
              title: 'Investors',
              icon: HeartHandshakeIcon,
              description:
                'Company information and reporting for people who back Keekii.',
            },
          ].map(card => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="group rounded-card border border-border bg-card p-6 transition-colors duration-(--keekii-dur-quick) hover:bg-accent/40"
              >
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-primary">
                  <Trans message={card.title} />
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  <Trans message={card.description} />
                </p>
              </Link>
            );
          })}
        </div>
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Come and listen"
        description="The free account is free. You do not need a card, and there is no trial to expire."
        actions={[
          {label: 'Create a free account', to: '/register'},
          {label: 'Compare Keekii plans', to: '/plans'},
        ]}
      />
    </CompanyPageLayout>
  );
}