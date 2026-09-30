import {
  BookOpenCheckIcon,
  FilePenIcon,
  LanguagesIcon,
  ListMusicIcon,
  MusicIcon,
  SearchIcon,
  ScrollTextIcon,
  SearchXIcon,
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

export function Component() {
  return (
    <CompanyPageLayout
      path="/top-song-lyrics"
      title="Top song lyrics"
      lead="The lyrics people look up most on Keekii, and the songs they come for. Searchable by song, by artist, and in the language the song was written in."
      actions={[
        {label: 'Search lyrics', to: '/search'},
        {label: 'Create a free account', to: '/register'},
      ]}
    >
      <CompanySectionBlock
        title="How Keekii lyrics work"
        description="Lyrics on Keekii are maintained content, not scraped text. That is the whole difference."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: ListMusicIcon,
              title: 'One page per track',
              description:
                'Lyrics live on the track page, viewable in full alongside the release credits and the version you are listening to.',
            },
            {
              icon: BookOpenCheckIcon,
              title: 'Text, not images',
              description:
                'Lyrics are selectable text, so they can be searched, copied, read aloud by a screen reader, and translated.',
            },
            {
              icon: FilePenIcon,
              title: 'Corrected by the writer',
              description:
                'A credited author can edit the lyrics on their own work. Corrections do not have to go through a support queue.',
            },
            {
              icon: LanguagesIcon,
              title: 'Any language',
              description:
                'Lyrics in any language are supported, with transliteration and translation where a reliable source exists.',
            },
            {
              icon: ScrollTextIcon,
              title: 'Version aware',
              description:
                'Lyrics are attached to a specific version, so a radio edit and the album cut do not share a text that fits neither.',
            },
            {
              icon: SearchIcon,
              title: 'Searchable while you listen',
              description:
                'Open lyrics from the now-playing view without leaving the track, so the words arrive when you want them.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock background="muted">
        <CompanyStats
          stats={[
            {value: 'Any', label: 'Language supported'},
            {value: 'Per version', label: 'Lyrics are attached'},
            {value: 'Text', label: 'Selectable, not an image'},
            {value: 'By author', label: 'Corrections are made'},
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Why a lyric is missing"
        description="Four reasons, in the order we check them."
        align="left"
        narrow
      >
        <CompanySteps
          steps={[
            {
              title: 'It was never supplied',
              description:
                'Most common by a distance. The release metadata arrived without lyrics, and nobody has added them since.',
            },
            {
              title: 'Nobody has claimed it',
              description:
                'Lyrics are added by the release, by a credited author, or through an import. If none of those has happened, there is no text.',
            },
            {
              title: 'It is not the version you are on',
              description:
                'Lyrics attach to a specific version. A remix, a live take and an acoustic version can each have their own text, or none.',
            },
            {
              title: 'It was removed deliberately',
              description:
                'A rights holder or an author can ask for lyrics to be removed. We do that, we tell the writer, and we do not replace the text with something approximate.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Why we do not fill in the gaps automatically"
        align="left"
        narrow
        background="muted"
      >
        <CompanyProse>
          <p>

            <Trans message="It would be easy to run missing lyrics through a transcription model and publish the result. We do not, and the reason is that a wrong lyric is worse than no lyric." />

            </p>
          <p>

            <Trans message="People search for a chorus because it means something to them, and they check what comes back against what they remember. A mis-transcribed line that sounds plausible is not a small error -- it is a false thing published in an author&rsquo;s name, and it is very hard to unstick once it has been screenshotted." />

            </p>
          <p>

            <Trans message="The consequence is a rule with no exceptions: on Keekii, lyrics are either supplied by someone entitled to supply them, or they are not there. We would rather a search return nothing than return something invented." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What you can do about a wrong lyric"
        description="If you wrote the words and the text is wrong, the fix is a message."
        align="left"
        narrow
      >
        <CompanyCallout title="Correction or removal" tone="primary">
          <p>
            Send author support the correct text and evidence that you wrote it
            -- a split sheet, a publishing registration, or a release that
            credits you elsewhere. Well-evidenced corrections are actioned, and a
            removal request is honoured.
          </p>
          <p>
            A credit correction is a priority, because a missing or misspelled
            credit is the thing that stops royalties reaching the person who
            earned them. That is not a documentation problem; it is a payment
            problem.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="From listeners and from writers."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Why does this track have no lyrics?',
              answer:
                'Usually because they were never supplied with the release. Search for the artist and check other versions, or send us the lyrics and we will attach them to the right version.',
            },
            {
              question: 'Can I add lyrics myself?',
              answer:
                'Yes, if you wrote the words or hold the rights to them. Send them to author support with evidence and we will publish them against the correct version.',
            },
            {
              question: 'The lyrics are wrong. Will you fix them?',
              answer:
                'Yes. Send the correct text with evidence of authorship. If the error is ours we will apologise for it in the reply.',
            },
            {
              question: 'Can I get the lyrics in my own language?',
              answer:
                'Transliteration and translation can sit alongside the original where we have a reliable source. Request a language through author support.',
            },
            {
              question: 'Can I use the lyrics on a video?',
              answer:
                'Lyrics are a separate work from the recording and are rights-managed separately. Publishing them on Keekii does not grant synchronisation rights.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Related"
        background="muted"
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: SearchXIcon,
              title: 'Search Keekii',
              description:
                'Artists, albums, tracks, playlists and lyrics, in any supported language.',
              to: '/search',
            },
            {
              icon: MusicIcon,
              title: 'Popular by country',
              description:
                'What each market is actually listening to, charted from real plays.',
              to: '/popular-by-country',
            },
            {
              icon: ScrollTextIcon,
              title: 'For Authors',
              description:
                'How lyrics, credits and writing royalties work on Keekii.',
              to: '/authors',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Find the words"
        description="Search the catalogue, open the lyrics, and keep listening without leaving the track."
        actions={[
          {label: 'Search lyrics', to: '/search'},
          {label: 'Create a free account', to: '/register'},
        ]}
      />
    </CompanyPageLayout>
  );
}
