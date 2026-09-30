import {
  BookOpenCheckIcon,
  CoinsIcon,
  FilePenIcon,
  LanguagesIcon,
  ListChecksIcon,
  MessageSquareQuoteIcon,
} from 'lucide-react';
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
      path="/authors"
      title="Lyrics, credits and the people behind the words"
      lead="A song has at least three authors and usually more. Keekii treats lyrics as content worth maintaining, and credits as facts that can be corrected by the people who know them."
      actions={[
        {label: 'See current pricing', to: '/pricing'},
        {label: 'Create a free account', to: '/register'},
      ]}
    >
      <CompanySectionBlock
        title="What Keekii does for writers"
        description="Lyrics on Keekii are not scraped text somebody typed in once. They are maintained content that authors and rights holders can work on."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: BookOpenCheckIcon,
              title: 'Lyrics are first-class content',
              description:
                'Every track that has lyrics shows them in the player, in a viewable view, and on the track page for search.',
            },
            {
              icon: FilePenIcon,
              title: 'Writers can correct them',
              description:
                'A credited author can edit the lyrics on their own work. Corrections do not go into a support queue.',
            },
            {
              icon: ListChecksIcon,
              title: 'Credits are explicit',
              description:
                'Songwriters, producers, featured artists and engineers are credited on the release, not implied by a title.',
            },
            {
              icon: CoinsIcon,
              title: 'Writing royalties',
              description:
                'Mechanical and performance-side participation is handled through your publisher or collection society and reported per period.',
            },
            {
              icon: LanguagesIcon,
              title: 'Non-English lyrics',
              description:
                'Lyrics in any language are supported. Transliteration and translation can sit alongside the original.',
            },
            {
              icon: MessageSquareQuoteIcon,
              title: 'Corrections are welcomed',
              description:
                'Wrong lyrics are a bug. Author support will action a well-evidenced correction, including a removal.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How lyrics get on a track"
        description="Three routes, in the order they usually happen."
        align="left"
        narrow
      >
        <CompanySteps
          steps={[
            {
              title: 'The release comes in',
              description:
                'Lyrics supplied with the release metadata are ingested automatically. Most tracks start here.',
            },
            {
              title: 'Someone with a claim adds them',
              description:
                'A credited author, label or publisher can add or replace lyrics directly from the track page.',
            },
            {
              title: 'Import from an existing catalogue',
              description:
                'If you are moving a catalogue to Keekii, bring your lyrics across at the same time rather than re-entering them.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What we need from a writer"
        description="Four things, and then we handle the rest."
        background="muted"
      >
        <CompanyProse>
          <ol>
            <li>
              <strong>Your credit on the release.</strong> Your name in the
              songwriter field of the release. If it is missing or misspelled, that
              is usually what stops royalties reaching you.
            </li>
            <li>
              <strong>A performing rights society registration,</strong> if you
              write rather than only record. Publishing and performance are
              separate streams and both need you in the right one.
            </li>
            <li>
              <strong>A publisher or a collection society,</strong> which is what
              actually collects the money. Keekii does not replace that; it
              reports into it.
            </li>
            <li>
              <strong>The lyrics,</strong> if they are not already supplied with
              the release. Written in the language you wrote them in.
            </li>
          </ol>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How royalties are reported to a writer"
        align="left"
        narrow
      >
        <CompanyProse>
          <p>

            <Trans message="Keekii reports usage on the composition rather than on the recording, so two records of the same song both count towards the writer. Reports run per period and can be exported, and they are structured so your publisher or society can reconcile them rather than take them on trust." />

            </p>
          <p>

            <Trans message="We do not attempt to calculate or pay performance royalties ourselves. That work belongs with your collecting society, and the number Keekii reports is the input it needs -- not a replacement for it." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="If your lyrics are wrong" tone="primary">
          <p>
            A mis-transcribed lyric is not a small problem. It is the thing a
            listener searches for, it is what gets screenshotted and shared, and
            a wrong chorus that sticks is very hard to unstick.
          </p>
          <p>
            If you wrote the words and the text on Keekii is wrong, you can
            correct it directly. If you are not credited and believe you should
            be, contact author support with evidence -- a split sheet, a
            publishing registration, a release that credits you elsewhere.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="From the writers and publishers we work with."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Do I need to be a recording artist to claim lyrics?',
              answer:
                'No. Songwriters, co-writers and publishers can claim and correct lyrics for work they wrote, whether or not they perform it.',
            },
            {
              question: 'Can I remove lyrics that have been mis-transcribed?',
              answer:
                'Yes. Send the correct text to author support with evidence of authorship and we will replace or remove it.',
            },
            {
              question: 'Who pays me for lyrics being viewed?',
              answer:
                'Nobody separately, and nobody is being short-changed. Lyrics views are a service to listeners; your royalty comes from the composition being played.',
            },
            {
              question: 'Can I have my work translated?',
              answer:
                'Translation and transliteration can sit alongside the original where we have a reliable source. Contact author support if you would like to add or correct one.',
            },
            {
              question: 'I am not credited anywhere. What now?',
              answer:
                'Contact author support with a split sheet, publishing registration or a release that credits you elsewhere. Credit corrections are handled as a priority.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Put your words back"
        description="If you wrote a song that is on Keekii and the words are wrong, the fix is a message away."
        actions={[
          {label: 'Contact author support', to: '/contact'},
          {label: 'Read the commitments', to: '/for-the-record'},
        ]}
      />
    </CompanyPageLayout>
  );
}
