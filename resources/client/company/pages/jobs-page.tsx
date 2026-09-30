import {Trans} from '@ui/i18n/trans';
import {
  BriefcaseIcon,
  CodeIcon,
  HeadphonesIcon,
  HeartIcon,
  MegaphoneIcon,
  PaletteIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFaq,
  CompanyProse,
  CompanySectionBlock,
} from '../company-page-sections';

const teams = [
  {
    icon: CodeIcon,
    team: 'Engineering',
    summary:
      'The player, the API, the ingestion pipeline and everything that has to stay up while people listen.',
    roles: [
      'Senior Backend Engineer, Catalogue',
      'Frontend Engineer, Player',
      'Infrastructure Engineer',
      'Data Engineer, Royalties',
    ],
  },
  {
    icon: HeadphonesIcon,
    team: 'Artist and Listener Support',
    summary:
      'The people an artist or a writer calls when a release is wrong, a statement is wrong, or a payment is late.',
    roles: [
      'Artist Support Specialist',
      'Rights and Royalties Analyst',
      'Support Engineer',
    ],
  },
  {
    icon: PaletteIcon,
    team: 'Product and Design',
    summary:
      'The surfaces people actually touch: the player, artist profiles, country channels and the admin.',
    roles: [
      'Product Designer',
      'Product Manager, Discovery',
      'Design Engineer',
    ],
  },
  {
    icon: MegaphoneIcon,
    team: 'Business',
    summary:
      'Labels, distributors, agencies and advertisers -- the other half of the catalogue.',
    roles: [
      'Partnerships Manager, Labels',
      'Advertising Account Executive',
      'Legal Counsel',
    ],
  },
];

const openings = teams.flatMap(team =>
  team.roles.map(role => ({...team, role})),
);

export function Component() {
  return (
    <CompanyPageLayout
      path="/jobs"
      title="Work on Keekii"
      lead="We are a small team in England and Wales building a music platform people in music would actually choose to use. Here is what is open right now."
      actions={[
        {label: 'See open roles', to: '/jobs#open-roles'},
        {label: 'Read about Keekii', to: '/about'},
      ]}
    >
      <CompanySectionBlock
        title="Why Keekii is worth joining"
        description="The music industry is full of companies that build software nobody outside the company uses. We built the opposite."
        align="left"
        narrow
      >
        <CompanyProse>
          <p>

            <Trans message="Keekii is a product of Storegrill Inc Ltd, registered in England and Wales. We are small enough that the person who designs a screen is in the same week as the person who deploys it, and small enough that a decision gets made rather than escalated." />

            </p>
          <p>

            <Trans message="That size cuts both ways and we would rather be honest about it. There is no deep bench to fall back on, so people here own whole problems rather than tickets. There is also no office politics to navigate, and very little ceremony between a decision and the thing it changes." />

            </p>
          <p>

            <Trans message="The work is unglamorous in the best possible way: making a player that does not stutter, a catalogue that stays correct, and royalty numbers that a songwriter can trust." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock
        id="open-roles"
        title="Open roles"
        description="Every role below is remote-first within the UK and Ireland unless the listing says otherwise."
        background="muted"
      >
        <div className="space-y-5">
          {teams.map(team => {
            const Icon = team.icon;
            return (
              <div
                key={team.team}
                className="rounded-card border border-border bg-card p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-card-sm bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="keekii-display text-xl">{team.team}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      <Trans message={team.summary} />
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {team.roles.map(role => (
                        <li
                          key={role}
                          className="flex items-start gap-2.5 text-sm/6 text-foreground"
                        >
                          <BriefcaseIcon className="mt-1 size-4 shrink-0 text-primary" />
                          <span>
                            <Trans message={role} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Trans
            message="We have :count roles open. Nothing that fits? Send a speculative application through the contact form and tell us what you would rather be working on."
            values={{count: openings.length}}
          />
        </p>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How we hire"
        description="Four stages, no take-home exercise longer than an evening."
        align="left"
        narrow
      >
        <CompanyProse>
          <ol className="space-y-4">
            <li>
              <strong>A conversation.</strong> Thirty minutes with the hiring
              manager about what you have built and what you want to build next.
              No whiteboard.
            </li>
            <li>
              <strong>A working session.</strong> Ninety minutes on a real
              problem from our backlog, with the person you would work alongside.
              We share the context we have.
            </li>
            <li>
              <strong>A paid piece of work.</strong> If the role has an output we
              can scope -- a feature, a migration, a set of screens -- that work
              is paid at contractor rates and belongs to you afterwards.
            </li>
            <li>
              <strong>References and an offer.</strong> Two references, then an
              offer in writing with the salary band stated up front.
            </li>
          </ol>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock background="muted">
        <CompanyCallout title="What we offer" tone="primary">
          <ul className="mt-2 space-y-2.5">
            {[
              'Salary band published with every role, and negotiable within it',
              'Remote-first across the UK and Ireland, with two team weeks a year in London',
              '31 days of annual leave plus public holidays, and a company-wide winter shutdown',
              'Private medical and dental cover from your first day',
              'A learning budget you are expected to spend, not justify',
              'Parental leave at full pay, and a phased return that is actually phased',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <HeartIcon className="mt-1 size-4 shrink-0 text-primary" />
                <span>
                  <Trans message={item} />
                </span>
              </li>
            ))}
          </ul>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Who we hire"
        description="The kinds of people who do well here, in case you are wondering whether to apply."
        align="left"
        narrow
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: UsersIcon,
              title: 'People who finish things',
              description:
                'Half-built work is the most expensive thing a small team can produce. We would rather have less of it shipped.',
            },
            {
              icon: HeadphonesIcon,
              title: 'People who care about music',
              description:
                'Not as a genre preference. As a reason to care whether a number is right.',
            },
            {
              icon: ShieldCheckIcon,
              title: 'People who say no carefully',
              description:
                'Saying yes to everything is easy and it is what kills small teams.',
            },
          ].map(value => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="rounded-card-sm border border-border bg-card p-6"
              >
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  <Trans message={value.title} />
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  <Trans message={value.description} />
                </p>
              </div>
            );
          })}
        </div>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="About applying, not about music."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Do I need to be in the UK?',
              answer:
                'Roles are advertised as UK and Ireland remote unless the listing says otherwise, because that is where we are registered to employ.',
            },
            {
              question: 'Can I work part time?',
              answer:
                'For some roles, yes. Say so in your application and we will shape the hours around it rather than pretending a full-time offer is flexible.',
            },
            {
              question: 'Do you sponsor visas?',
              answer:
                'Not at the moment. We are a small employer in England and Wales and cannot support sponsorship reliably.',
            },
            {
              question: 'How long does the process take?',
              answer:
                'Usually two to three weeks from application to offer, and we will tell you if a stage is going to take longer.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Nothing that fits today?"
        description="Speculative applications are genuinely read. Tell us what you would rather be working on and why Keekii is the place to do it."
        actions={[
          {label: 'Send a speculative application', to: '/contact'},
          {label: 'Read about Keekii', to: '/about'},
        ]}
      />
    </CompanyPageLayout>
  );
}