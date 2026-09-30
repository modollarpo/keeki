import {
  ArrowRightLeftIcon,
  FileCheckIcon,
  FolderUpIcon,
  ListMusicIcon,
  Music4Icon,
  PackageOpenIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
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
      path="/import-your-music"
      title="Import your music to Keekii"
      lead="Bringing your catalogue over from another service, or loading files from your own machine. Keekii matches what it can, flags what it cannot, and tells you the difference between the two."
      actions={[
        {label: 'Start an import', to: '/account/settings/import'},
        {label: 'Submit a catalogue', to: '/vendors'},
      ]}
    >
      <CompanySectionBlock
        title="Two different things"
        description="People mean two different things by import, and they need different parts of Keekii."
      >
        <CompanyFeatureGrid
          columns={2}
          features={[
            {
              icon: Music4Icon,
              title: 'Import your music',
              description:
                'You already own the masters and want them on Keekii. You upload the files and the metadata, and you keep the rights. This is the page you are on.',
            },
            {
              icon: PackageOpenIcon,
              title: 'Submit a catalogue',
              description:
                'A label, distributor or manager moving a whole catalogue, with rights documentation and a commercial agreement. That process is described on the Vendors page.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What an import can carry across"
        description="What moves, and what has to be re-entered."
        background="muted"
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: FolderUpIcon,
              title: 'Audio files',
              description:
                'Your masters, in the formats Keekii accepts for delivery, checked for integrity before anything is published.',
            },
            {
              icon: ListMusicIcon,
              title: 'Releases and tracks',
              description:
                'Albums, EPs, singles, track order, versions, durations, release dates and explicit flags.',
            },
            {
              icon: FileCheckIcon,
              title: 'Credits',
              description:
                'Artists, featured artists, songwriters, producers and engineers, kept as credits rather than folded into a title.',
            },
            {
              icon: SearchIcon,
              title: 'Artwork',
              description:
                'Cover images, carried across where the quality is good enough and re-fetched where it is not.',
            },
            {
              icon: SparklesIcon,
              title: 'Lyrics',
              description:
                'Existing lyrics come across with the release. Where they are missing, that is a separate conversation -- see Top Song Lyrics.',
            },
            {
              icon: ArrowRightLeftIcon,
              title: 'Playlists and library',
              description:
                'Your playlists and likes are not part of an import -- they live on your Keekii account, and the import adds to them.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How an import works"
        description="Five steps, and the fourth is the one that saves you the most work."
        align="left"
        narrow
      >
        <CompanySteps
          steps={[
            {
              title: 'Connect a source',
              description:
                'Link a service you are moving from, or upload files directly. Connecting a service gives us release metadata to match against, which is the difference between an import and a data entry exercise.',
            },
            {
              title: 'Choose what comes across',
              description:
                'Everything, a selection of releases, or a single artist. Nothing is published until you confirm, so an over-eager first pass costs nothing.',
            },
            {
              title: 'Match and upload',
              description:
                'Keekii matches releases against what it already holds, checks the audio, and flags anything it cannot identify rather than guessing at it.',
            },
            {
              title: 'Review the validation report',
              description:
                'You get a list of what imported cleanly, what was flagged, and exactly why. This is where the work is saved -- fix the flagged items here, not by publishing something wrong and apologising later.',
            },
            {
              title: 'Publish',
              description:
                'Once you approve, releases go live across all fifteen markets. You can still edit metadata, credits and lyrics afterwards.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What gets flagged, and why"
        align="left"
        narrow
        background="muted"
      >
        <CompanyProse>
          <h2>
<Trans message="Missing or inconsistent metadata" />
</h2>
          <p>

            <Trans message="Release dates that disagree with the track dates, an album with no release type, a track numbered out of sequence. None of it stops an import, and all of it makes the release harder to find." />

            </p>

          <h2>
<Trans message="Unmatched releases" />
</h2>
          <p>

            <Trans message="A release that already exists on Keekii from a different source will be matched rather than duplicated. If the match is uncertain we say so and let you decide, because a duplicated release splits the listener counts and the royalty reporting for the same song." />

            </p>

          <h2>
<Trans message="Audio that does not meet delivery spec" />
</h2>
          <p>

            <Trans message="Damaged files, files below the minimum quality, and anything we cannot decode. These are rejected at the point of upload rather than published and found later." />

            </p>

          <h2>
<Trans message="Rights questions" />
</h2>
          <p>

            <Trans message="An import is not a rights review. Publishing something to Keekii asserts that you have the right to distribute it, and we take that seriously -- a claim from a rights holder affects both of us, and it will be handled as a formal matter rather than a support ticket." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="Before you import a large catalogue" tone="primary">
          <p>
            Talk to us first. A catalogue with ten thousand releases will hit
            every edge case in the pipeline, and the ones that matter are
            metadata consistency and duplicate matching -- not upload speed.
          </p>
          <p>
            We would rather run a sample of a hundred releases with you, agree
            how your metadata should be interpreted, and then do the rest. It
            takes longer at the start and much less time in the middle.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="The questions imports always raise."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Do I lose my playlists and likes when I move?',
              answer:
                'No, and they are not part of the import either way. They live on your Keekii account, and an import adds releases to your library rather than replacing it.',
            },
            {
              question: 'Will the same song appear twice?',
              answer:
                'Matching is designed to prevent it. When a release already exists on Keekii we match to it instead of creating a duplicate, and we flag anything ambiguous for you to decide.',
            },
            {
              question: 'Who owns the music after an import?',
              answer:
                'You do. An import grants us the licence to host and stream the music on Keekii, and nothing more. We never take ownership.',
            },
            {
              question: 'Can I import lyrics too?',
              answer:
                'Yes, if you hold them. They are carried across with the release, and you can also add or correct them afterwards.',
            },
            {
              question: 'What happens to my listening history?',
              answer:
                'It stays where it is. Listening history is tied to your account, not to a file, and it survives any import or subscription change.',
            },
            {
              question: 'I am moving a whole label catalogue. Same process?',
              answer:
                'Not quite. A full label submission is a rights and commercial conversation, so start on the Vendors page rather than running an import.',
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
              icon: ShieldCheckIcon,
              title: 'For Artists',
              description:
                'Royalties, content claims and what happens to your catalogue.',
              to: '/artists',
            },
            {
              icon: PackageOpenIcon,
              title: 'For Vendors',
              description:
                'Submitting a full catalogue as a label, distributor or manager.',
              to: '/vendors',
            },
            {
              icon: SparklesIcon,
              title: 'Top Song Lyrics',
              description:
                'How lyrics work on Keekii, and what to do about a missing or wrong one.',
              to: '/top-song-lyrics',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Bring it across"
        description="Connect a source or upload your files. Nothing is published until you have reviewed the validation report."
        actions={[
          {label: 'Start an import', to: '/account/settings/import'},
          {label: 'Submit a catalogue', to: '/vendors'},
        ]}
      />

      <p className="pb-10 text-center text-sm text-muted-foreground">
        <Link to="/support" className="underline underline-offset-4">
          Import stuck or behaving oddly? Support can look at it directly.
        </Link>
      </p>
    </CompanyPageLayout>
  );
}
