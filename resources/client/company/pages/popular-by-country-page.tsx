import {
  BarChart3Icon,
  FlameIcon,
  GlobeIcon,
  HeadphonesIcon,
  SearchIcon,
  TrendingUpIcon,
  TrophyIcon,
} from 'lucide-react';
import {Link} from 'react-router';
import {Trans} from '@ui/i18n/trans';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFeatureGrid,
  CompanyProse,
  CompanySectionBlock,
} from '../company-page-sections';

const markets = [
  {name: 'Nigeria', slug: 'nigeria', note: 'Afrobeats, amapiano, highlife, gospel'},
  {name: 'Ghana', slug: 'ghana', note: 'Highlife, hiplife, gospel, Afrobeats'},
  {name: 'South Africa', slug: 'south-africa', note: 'Amapiano, gqom, kwaito, jazz'},
  {name: 'United Kingdom and Ireland', slug: 'united-kingdom', note: 'Grime, drill, indie, folk'},
  {name: 'United States', slug: 'united-states', note: 'Hip-hop, country, indie, latin'},
  {name: 'Canada', slug: 'canada', note: 'Hip-hop, indie, folk, electronic'},
  {name: 'Australia', slug: 'australia', note: 'Indie, electronic, country, surf'},
  {name: 'India', slug: 'india', note: 'Filmi, indie, devotional, lo-fi'},
  {name: 'Brazil', slug: 'brazil', note: 'MPB, baile, funk, samba'},
  {name: 'Germany', slug: 'germany', note: 'Techno, hip-hop, pop, metal'},
  {name: 'France', slug: 'france', note: 'Rap, house, indie, pop'},
  {name: 'Spain', slug: 'spain', note: 'Reggaeton, flamenco, pop, indie'},
  {name: 'Japan', slug: 'japan', note: 'J-pop, city pop, anisong, jazz'},
  {name: 'South Korea', slug: 'south-korea', note: 'K-pop, indie, hip-hop, classical'},
];

export function Component() {
  return (
    <CompanyPageLayout
      path="/popular-by-country"
      title="Popular music by country"
      lead="What people in each market are actually listening to right now, charted from real plays rather than assembled by hand. Fifteen countries, and no way to buy a place on any of them."
      actions={[
        {label: 'Browse your country', to: '/channels'},
        {label: 'Create a free account', to: '/register'},
      ]}
    >
      <CompanySectionBlock
        title="How these charts are built"
        description="The methodology matters more than the list, so it is here rather than in a footnote."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: HeadphonesIcon,
              title: 'Counted plays, not scrapes',
              description:
                'A track enters a country chart by being played in that country, on any Keekii plan, across app and web.',
            },
            {
              icon: TrendingUpIcon,
              title: 'Weighted by completion',
              description:
                'A play that someone finishes counts for more than one they skip. Skips are not ignored, they are discounted.',
            },
            {
              icon: SearchIcon,
              title: 'Search is not a vote',
              description:
                'Searching for a track does not move it up a chart. Charts reflect listening, not curiosity.',
            },
            {
              icon: GlobeIcon,
              title: 'Located by listening',
              description:
                'A listener in Lagos is what puts a track on the Nigeria chart, not the artist\u2019s label address.',
            },
            {
              icon: BarChart3Icon,
              title: 'Updated continuously',
              description:
                'The chart is recomputed on a rolling basis, so it reflects the last few days rather than last quarter.',
            },
            {
              icon: TrophyIcon,
              title: 'Nobody pays for a position',
              description:
                'Charts, search results and editorial playlists are not for sale. Advertising buys attention, never rank.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Pick your market"
        description="Every country Keekii is live in, with the scenes currently carrying it."
        background="muted"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {markets.map(market => (
            <Link
              key={market.slug}
              to={`/channel/country-${market.slug}`}
              className="group flex items-start justify-between gap-4 rounded-card border border-border bg-card p-5 transition-colors duration-(--keekii-dur-quick) hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground">
                  <Trans message={market.name} />
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  <Trans message={market.note} />
                </p>
              </div>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
              >
                &rarr;
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Trans message="Markets update as listening changes, so the line-up at the top of a chart today may be different by the weekend." />
        </p>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="For artists in these markets"
        align="left"
        narrow
      >
        <CompanyProse>
          <h2>
<Trans message="Your music can chart here without a distributor relationship" />
</h2>
          <p>

            <Trans message="The country chart is not gated by which aggregator delivered your release. If a listener in Accra plays your track fifty times, it moves in Ghana. Catalogue depth and label affiliation are not inputs." />

            </p>

          <h2>
<Trans message="Local languages are first-class, not a workaround" />
</h2>
          <p>

            <Trans message="Tracks are indexed in the language they are performed in, alongside transliteration, so a search in Pidgin, Yoruba, Igbo, Twi, Zulu, Portuguese or Korean finds the track rather than a romanised approximation of it." />

            </p>

          <h2>
<Trans message="What we will not do with these lists" />
</h2>
          <p>

            <Trans message="A country chart is a record of what people listened to. We will not accept payment to move a track, we will not sell a featured slot, and we will not quietly remove a track that is doing well because a label objected. If a track is removed it is for a rights reason, and the reason is given." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="What the chart is not" tone="primary">
          <p>
            It is not a popularity contest run by a label, and it is not a
            prediction of what will be big next month. It is the least
            gameable version we could build: plays, weighted by whether people
            finished them, located by where they were listening.
          </p>
          <p>
            The honest limitation is coverage. A market with a smaller listener
            base on Keekii will have a noisier chart than the UK, and a track
            with a committed local audience can out-chart a much larger streaming
            number. That is a real property of a listener-driven chart and we
            would rather you know it than assume otherwise.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Related"
        description="Where people go after they land on a chart."
        background="muted"
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: FlameIcon,
              title: 'Genre channels',
              description:
                'Dig further in by genre rather than by geography.',
              to: '/channels',
            },
            {
              icon: SearchIcon,
              title: 'Search everything',
              description:
                'Artists, albums, tracks, playlists and lyrics, in any supported language.',
              to: '/search',
            },
            {
              icon: BarChart3Icon,
              title: 'Top song lyrics',
              description:
                'What people are searching the words of, right now.',
              to: '/top-song-lyrics',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Start from where you are"
        description="Pick a country, pick a genre, or just press play and let the radio do it."
        actions={[
          {label: 'Browse channels', to: '/channels'},
          {label: 'Create a free account', to: '/register'},
        ]}
      />
    </CompanyPageLayout>
  );
}