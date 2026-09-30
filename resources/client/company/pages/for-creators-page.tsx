import {
  BadgeCheckIcon,
  CopyrightIcon,
  FileCheckIcon,
  ListMusicIcon,
  MicVocalIcon,
  ScrollTextIcon,
  UsersIcon,
} from 'lucide-react';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFaq,
  CompanyFeatureGrid,
  CompanySectionBlock,
  CompanySteps,
} from '../company-page-sections';

export function Component() {
  return (
    <CompanyPageLayout
      path="/creators"
      title="Music cleared for what you make"
      lead="Every video, podcast, stream and post you publish needs music that will not be claimed, muted or taken down on the day it goes live. Keekii's creator catalogue is cleared for exactly that."
      actions={[
        {label: 'See current pricing', to: '/pricing'},
        {label: 'Create a free account', to: '/register'},
      ]}
    >
      <CompanySectionBlock
        title="What creators use Keekii for"
        description="The four formats that account for most of the music being cleared on Keekii."
      >
        <CompanyFeatureGrid
          columns={4}
          features={[
            {
              icon: ListMusicIcon,
              title: 'Video and YouTube',
              description:
                'Background, intro and outro music cleared for monetised channels.',
            },
            {
              icon: MicVocalIcon,
              title: 'Podcasts',
              description:
                'Theme beds, stings and underscore with no limit on episode length.',
            },
            {
              icon: UsersIcon,
              title: 'Livestreams',
              description:
                'Music that will not trigger a takedown mid-stream on any platform.',
            },
            {
              icon: ScrollTextIcon,
              title: 'Social and ads',
              description:
                'Cleared tracks for brand content and paid social, worldwide.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What cleared means on Keekii"
        description="Four rights, and the difference between them is the thing that gets a video muted."
        align="left"
        narrow
      >
        <CompanyFeatureGrid
          columns={2}
          features={[
            {
              icon: FileCheckIcon,
              title: 'Cleared for synchronisation',
              description:
                'You may use the track as part of a video, a stream or a podcast, commercially, worldwide.',
            },
            {
              icon: CopyrightIcon,
              title: 'Cleared for advertising',
              description:
                'Paid media and brand content, including broadcast and online, in the territories covered.',
            },
            {
              icon: BadgeCheckIcon,
              title: 'Cleared for social platforms',
              description:
                'Short-form platforms with their own music-detection systems, which are stricter than most.',
            },
            {
              icon: ScrollTextIcon,
              title: 'Cleared for live use',
              description:
                'Real-time use on a stream or in a public space, without a separate licence.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="How to get cleared music"
        description="Four steps, and the last one is the one people forget."
        background="muted"
      >
        <CompanySteps
          steps={[
            {
              title: 'Take a plan that covers creator use',
              description:
                'Commercial use of Keekii music sits on the Premium plans. Choose the one that matches how many projects you run.',
            },
            {
              title: 'Find tracks in the creator catalogue',
              description:
                'Creator-cleared tracks are marked in the catalogue, so you can filter to what you are actually allowed to publish.',
            },
            {
              title: 'Save the licence with the project',
              description:
                'Download or pin the licence reference for each project. If a rights holder ever queries it, that record is what answers the question.',
            },
            {
              title: 'Keep the attribution',
              description:
                'Where a track requires credit, the licence says so. Credits in the description cost nothing and prevent most disputes.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow>
        <CompanyCallout title="The honest limitation" tone="primary">
          <p>
            A cleared track is cleared for a defined use, not for every use you
            might invent. Storing a track in a private library is not
            synchronisation, and neither is using a clip of it in a passing
            joke.
          </p>
          <p>
            The most common reason a Keekii video gets muted is not that the music
            was not cleared -- it is that the track was never cleared for that
            specific use in the first place. If you are unsure, ask creator
            support before you publish rather than after.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="Licensing questions creators ask most."
      >
        <CompanyFaq
          questions={[
            {
              question: 'Can I use Keekii music in monetised YouTube videos?',
              answer:
                'Yes, with a track from the creator catalogue and the licence reference kept alongside the project. Keep the credit where the licence requires it.',
            },
            {
              question: 'What about client work and paid ads?',
              answer:
                'Advertising use is separately cleared. Some creator-cleared tracks are not cleared for advertising, and the licence states which applies.',
            },
            {
              question: 'Can I use it on more than one channel?',
              answer:
                'The licence follows the project, not the account. You can use the same cleared track across your own channels, but each project keeps its own licence record.',
            },
            {
              question: 'Does the licence expire?',
              answer:
                'While your plan is active and you use the track within its licence, it stays cleared. An expired plan means an expired licence, so keep an eye on renewals.',
            },
            {
              question: 'Can I request a track that is not in the catalogue?',
              answer:
                'Yes. Creator support can look at specific titles and, where rights allow, work towards clearing them.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Make something with it"
        description="Pick a plan, find a track, and publish. If you get it wrong, creator support will sort it before your audience notices."
        actions={[
          {label: 'See current pricing', to: '/pricing'},
          {label: 'Read about Keekii plans', to: '/plans'},
          {label: 'Contact creator support', to: '/contact'},
        ]}
      />
    </CompanyPageLayout>
  );
}