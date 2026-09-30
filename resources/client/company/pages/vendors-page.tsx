import {
  BarChart3Icon,
  BoxesIcon,
  CheckCircle2Icon,
  GlobeIcon,
  HandshakeIcon,
  ReceiptIcon,
} from 'lucide-react';
import {Trans} from '@ui/i18n/trans';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFaq,
  CompanyFeatureGrid,
  CompanyProse,
  CompanySectionBlock,
  CompanyStats,
  CompanySteps,
} from '../company-page-sections';

const catalogueFields = [
  {label: 'Track title', detail: 'Official title as released'},
  {label: 'Version', detail: 'Remix, live, acoustic, edit'},
  {label: 'ISRC', detail: 'Recording identifier'},
  {label: 'Artists', detail: 'Primary, featured and credited'},
  {label: 'Album', detail: 'Release title and type'},
  {label: 'Release date', detail: 'Original release, not re-release'},
  {label: 'Writers', detail: 'Songwriters and composers'},
  {label: 'Producers', detail: 'Production credits'},
  {label: 'Explicit flag', detail: 'Clean, explicit or unrated'},
  {label: 'Genre and mood', detail: 'At least one required'},
  {label: 'Lyrics', detail: 'Where you hold them'},
  {label: 'Territory rights', detail: 'Worldwide or restricted'},
];

export function Component() {
  return (
    <CompanyPageLayout
      path="/vendors"
      title="Get your catalogue on Keekii"
      lead="Keekii accepts catalogue from labels, distributors, aggregators, artists and rights holders. If you have masters, this is what the process looks like and what we need from you."
      actions={[
        {label: 'Start a submission', to: '/contact'},
        {label: 'See current pricing', to: '/pricing'},
      ]}
    >
      <CompanySectionBlock
        title="What we accept"
        description="Master recordings, with the metadata and rights to support them."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: BoxesIcon,
              title: 'Physical and digital releases',
              description:
                'Albums, EPs, singles and soundtracks, in any language, from any genre.',
            },
            {
              icon: GlobeIcon,
              title: 'Local and independent catalogues',
              description:
                'Independent labels and self-released artists are not a secondary intake. A single from Lagos is handled the same way as a major release.',
            },
            {
              icon: CheckCircle2Icon,
              title: 'Clear or documented rights',
              description:
                'Either you own the rights or you can evidence that you have them. We will not guess, and we will not take a catalogue on trust.',
            },
            {
              icon: BarChart3Icon,
              title: 'You keep your reporting',
              description:
                'Usage and revenue reporting is available to you, on the same basis as for our own label and artist relationships.',
            },
            {
              icon: HandshakeIcon,
              title: 'Aggregator relationships honoured',
              description:
                'If you already deliver through a distributor or aggregator, tell us. We would rather integrate than duplicate.',
            },
            {
              icon: ReceiptIcon,
              title: 'Transparent terms',
              description:
                'The agreement sets out what we can do with the masters, for how long, and on what notice. No exclusivity by default.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock background="muted">
        <CompanyStats
          stats={[
            {value: '0', label: 'Exclusivity required to submit'},
            {value: 'Any', label: 'Genre or language accepted'},
            {value: '15', label: 'Markets available on day one'},
            {value: 'Web', label: 'And iOS and Android clients'},
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How submission works"
        description="Four stages, and you can stop at any of them."
        align="left"
        narrow
      >
        <CompanySteps
          steps={[
            {
              title: 'Send a brief',
              description:
                'What you have, how many releases, what rights you hold and which territories. A paragraph is enough to start.',
            },
            {
              title: 'Rights review',
              description:
                'We check what you can evidence you own. If the answer is unclear we tell you now, not after delivery.',
            },
            {
              title: 'Metadata and audio delivery',
              description:
                'Deliver masters and metadata in an agreed format. We validate, flag anything incomplete, and tell you before anything goes live.',
            },
            {
              title: 'Go live and report',
              description:
                'Your catalogue is searchable across all fifteen markets, with usage and revenue reporting from the first period.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Metadata we need"
        description="This is the part that decides whether your catalogue is findable."
        background="muted"
      >
        <div className="overflow-x-auto rounded-card border border-border bg-card">
          <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-5 py-3.5 font-semibold">Field</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">What we need</th>
              </tr>
            </thead>
            <tbody>
              {catalogueFields.map(field => (
                <tr
                  key={field.label}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-foreground">
                    <Trans message={field.label} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <Trans message={field.detail} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Trans message="Missing metadata does not block a release, but it does limit how well it will be found. We will tell you exactly which fields are weak." />
        </p>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="The agreement"
        align="left"
        narrow
        background="elevated"
      >
        <CompanyProse>
          <h2>
<Trans message="What we are granted" />
</h2>
          <p>

            <Trans message="A non-exclusive licence to host, stream and make the masters available on Keekii, in the territories and for the term set out in the agreement. Exclusivity is available where it makes commercial sense, and is never a condition of submitting." />

            </p>

          <h2>
<Trans message="What you keep" />
</h2>
          <p>

            <Trans message="Ownership. Your masters, your compositions, your metadata. We take a licence; we do not take title, and we do not acquire anything by virtue of delivery." />

            </p>

          <h2>
<Trans message="Term and termination" />
</h2>
          <p>

            <Trans message="The term, the notice period and what happens to the catalogue on termination are all in the agreement. If you leave, your catalogue goes with you -- it does not stay on Keekii as ours." />

            </p>

          <h2>
<Trans message="Reporting" />
</h2>
          <p>

            <Trans message="Usage and revenue reporting on the same basis as our own deals, exportable, per period, on the composition as well as the recording where you are entitled to both." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow>
        <CompanyCallout title="If your metadata is a mess" tone="primary">
          <p>
            It usually is, and it is not a reason not to submit. A sheet from a
            label with inconsistent release dates and half the writers missing is
            a normal starting point, and our intake work is partly there to fix
            exactly that.
          </p>
          <p>
            Send what you have. We will return a validation report listing what is
            wrong, and you can decide what to fix and what to leave.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="From labels, managers and independent distributors."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Do I have to be a label to submit?',
              answer:
                'No. Artists, managers, publishers, aggregators and rights holders can all submit. A self-released single is a normal submission.',
            },
            {
              question: 'Do you need exclusive rights?',
              answer:
                'No. The standard agreement is non-exclusive. Exclusivity is available in some territories where it makes sense commercially.',
            },
            {
              question: 'I already have a distributor. Should I still contact you?',
              answer:
                'Tell us who. We would rather integrate with an existing pipeline than have the same masters delivered twice.',
            },
            {
              question: 'What happens if my metadata is wrong?',
              answer:
                'We return a validation report before anything goes live. You decide what to correct, and corrections you make are reflected in reporting.',
            },
            {
              question: 'How do I get paid?',
              answer:
                'Revenue is reported per period and settled according to the agreement. Reporting is available to you, not just to us.',
            },
            {
              question: 'How long does intake take?',
              answer:
                'It depends on catalogue size and how much needs fixing. Rights review is the part worth doing properly, so that is where the time goes.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Send us the catalogue"
        description="A brief is enough to start. We will tell you quickly if the rights are not clear, which is more useful than a slow yes."
        actions={[
          {label: 'Start a submission', to: '/contact'},
          {label: 'Read For the Record', to: '/for-the-record'},
        ]}
      />
    </CompanyPageLayout>
  );
}