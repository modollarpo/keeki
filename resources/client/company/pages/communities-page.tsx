import {Trans} from '@ui/i18n/trans';
import {
  CalendarHeartIcon,
  GuitarIcon,
  HandHeartIcon,
  MapPinIcon,
  MicVocalIcon,
  RadioTowerIcon,
  UsersIcon,
} from 'lucide-react';
import {Link} from 'react-router';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFeatureGrid,
  CompanySectionBlock,
} from '../company-page-sections';

const markets = [
  {code: 'NG', name: 'Nigeria'},
  {code: 'GH', name: 'Ghana'},
  {code: 'ZA', name: 'South Africa'},
  {code: 'GB', name: 'United Kingdom'},
  {code: 'IE', name: 'Ireland'},
  {code: 'US', name: 'United States'},
  {code: 'CA', name: 'Canada'},
  {code: 'AU', name: 'Australia'},
  {code: 'IN', name: 'India'},
  {code: 'BR', name: 'Brazil'},
  {code: 'DE', name: 'Germany'},
  {code: 'FR', name: 'France'},
  {code: 'ES', name: 'Spain'},
  {code: 'JP', name: 'Japan'},
  {code: 'KR', name: 'South Korea'},
];

const waysToTakePart = [
  {
    icon: UsersIcon,
    title: 'Run a channel',
    description:
      'Channels are how a scene gets a front door on Keekii. A channel is a playlist plus a description plus a curator, and anybody can curate one.',
    to: '/artists',
  },
  {
    icon: MicVocalIcon,
    title: 'Put your music up',
    description:
      'The fastest way to be part of a Keekii community is to be in the catalogue. Independent releases go up without a distributor.',
    to: '/artists',
  },
  {
    icon: RadioTowerIcon,
    title: 'Take part in a listening room',
    description:
      'Listening rooms are where a curator and their listeners end up at the same time and argue about songs in public.',
    to: '/live-radio',
  },
  {
    icon: GuitarIcon,
    title: 'Come as a session musician',
    description:
      'Credits are how scenes hold together on a streaming service. If you played on it, get credited, and correct the entry if you are not.',
    to: '/authors',
  },
  {
    icon: HandHeartIcon,
    title: 'Support a local label',
    description:
      'Small labels are doing the work of keeping a scene audible. Keekii\'s distribution and artist pages exist so they can.',
    to: '/vendors',
  },
  {
    icon: CalendarHeartIcon,
    title: 'Tell us what is missing',
    description:
      'If a market is absent from Keekii, it is usually a data problem rather than a decision. We would rather hear about it.',
    to: '/contact',
  },
];

export function Component() {
  return (
    <CompanyPageLayout
      path="/communities"
      title="Music communities, not just music"
      lead="A track is not a community. Keekii is built around the people, scenes and collectives who make the tracks, so that a local scene has somewhere to live on a global platform."
      actions={[
        {label: 'Popular music by country', to: '/popular-by-country'},
        {label: 'For Artists', to: '/artists'},
      ]}
    >
      <CompanySectionBlock
        title="What we mean by a community"
        align="left"
        narrow
      >
        <div className="space-y-5 text-base leading-7 text-muted-foreground">
          <p>
            The most interesting thing about music is rarely the audio file. It is
            the scene around it: the label that put out the record, the promoter
            who got the room, the engineer who recorded it, the producer who
            argued about the mix, the people who were in the crowd.
          </p>
          <p>
            Streaming flattened all of that into a flat list of titles. Keekii is
            an attempt to put the structure back -- channels that a scene runs
            itself, country channels with real curatorial intent, credits that
            people can correct, and a playlists-first way of listening that
            assumes you arrived through someone else's taste rather than a
            search box.
          </p>
        </div>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Fifteen markets, fifteen front doors"
        description="Every country with a Keekii country channel gets a proper entry point -- artists ordered by real listening in that market, not a global ranking."
        background="muted"
      >
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {markets.map(market => (
            <Link
              key={market.code}
              to={`/channel/country-${market.code.toLowerCase()}`}
              className="group flex items-center gap-3 rounded-card-sm border border-border bg-card px-4 py-3.5 transition-colors duration-(--keekii-dur-quick) hover:bg-accent/40"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-card-xs bg-primary/10 text-xs font-semibold text-primary">
                {market.code}
              </span>
              <span className="min-w-0 truncate text-sm font-medium text-foreground group-hover:text-primary">
                <Trans message={market.name} />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Trans message="Missing a market? It is usually missing artist data rather than a decision on our part." />{' '}
          <Link
            to="/popular-by-country"
            className="underline underline-offset-4"
          >
            <Trans message="See all countries" />
          </Link>
        </p>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Six ways to be part of one"
        description="Keekii is used by listeners, by the people who make the music, and by the people who keep a scene running. All three belong here."
      >
        <CompanyFeatureGrid
          columns={3}
          features={waysToTakePart.map(item => ({
            icon: item.icon,
            title: item.title,
            description: item.description,
            to: item.to,
          }))}
        />
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="On country channels" tone="primary">
          <p>
            Country channels filter the catalogue by where an artist is from, not
            by where a track was recorded, and they order by real play counts in
            that market. That means a Keekii country channel is a live signal of
            what a country is actually listening to rather than a marketing
            page.
          </p>
          <p>
            The same reasoning is why country data is something artists set on
            their own profiles. If your country is wrong, your music is
            effectively invisible in that market, and no amount of promotion will
            fix it.
          </p>
          <p className="flex items-start gap-2">
            <MapPinIcon className="mt-1 size-4 shrink-0 text-primary" />
            <span>
              <Trans message="Artists: check that your profile country is set correctly. It is the single highest-impact field on your profile." />
            </span>
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Put your scene on the map"
        description="Whether you are a label, a promoter, an artist or a listener who wants their local music taken seriously -- there is a version of that which fits here."
        actions={[
          {label: 'For Artists', to: '/artists'},
          {label: 'For Vendors', to: '/vendors'},
          {label: 'Contact us', to: '/contact'},
        ]}
      />
    </CompanyPageLayout>
  );
}