import {
  AppleIcon,
  BellRingIcon,
  DownloadIcon,
  GlobeIcon,
  HeadphonesIcon,
  PlayCircleIcon,
  QrCodeIcon,
  Share2Icon,
  SmartphoneIcon,
  WifiOffIcon,
} from 'lucide-react';
import {Link} from 'react-router';
import {Trans} from '@ui/i18n/trans';
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

export function Component() {
  return (
    <CompanyPageLayout
      path="/free-mobile-app"
      title="Keekii Free on your phone"
      lead="The Keekii mobile app is free to download and free to use. The whole catalogue, the player, your library and your playlists, on the phone in your pocket."
      actions={[
        {label: 'Get the app', to: '/download'},
        {label: 'Create a free account', to: '/register'},
      ]}
    >
      <CompanySectionBlock
        title="Why Keekii Free"
        description="Free is a plan, not a trial. Nothing in it expires and nothing in it is held back to force an upgrade."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: HeadphonesIcon,
              title: 'The whole catalogue',
              description:
                'Unlimited access to everything on Keekii, across fifteen markets, for as long as you want it.',
            },
            {
              icon: PlayCircleIcon,
              title: 'Offline listening',
              description:
                'Download albums and playlists for flights, commutes and the places your data does not reach.',
            },
            {
              icon: Share2Icon,
              title: 'Playlists and library',
              description:
                'Your playlists follow you between the app and the web, on the same account.',
            },
            {
              icon: GlobeIcon,
              title: 'Built for local markets',
              description:
                'Search, charts and channels for the music where you are, in the language you search in.',
            },
            {
              icon: BellRingIcon,
              title: 'Release alerts',
              description:
                'Follow the artists you care about and be told when something new arrives.',
            },
            {
              icon: WifiOffIcon,
              title: 'Low-data mode',
              description:
                'Choose a lower bitrate when you are on a metered connection, without hunting through settings.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Get the app"
        description="Two stores, one account, one library."
        background="muted"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-4 rounded-card border border-border bg-card p-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-card-sm bg-primary/10 text-primary">
              <AppleIcon className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground">iOS</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keekii for iPhone and iPad, on the App Store. Requires iOS 16 or
                later.
              </p>
              <Link
                to="/download"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <DownloadIcon className="size-4" />
                Download for iOS
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-card border border-border bg-card p-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-card-sm bg-primary/10 text-primary">
              <SmartphoneIcon className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground">Android</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keekii for Android, on Google Play. Requires Android 8 or later.
              </p>
              <Link
                to="/download"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <DownloadIcon className="size-4" />
                Download for Android
              </Link>
            </div>
          </div>
        </div>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Setting it up"
        description="Four steps, about two minutes."
        align="left"
        narrow
      >
        <CompanySteps
          steps={[
            {
              title: 'Download the app',
              description:
                'From the App Store or Google Play. The download is free and the app does not need payment details to open.',
            },
            {
              title: 'Sign in or create an account',
              description:
                'Use the same account as the web player and your playlists are already there.',
            },
            {
              title: 'Choose your data setting',
              description:
                'Standard or low-data, and whether downloads happen on Wi-Fi only. Both can be changed later.',
            },
            {
              title: 'Start listening',
              description:
                'Pick up where you left off, or start from a country chart, a genre channel or a search.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What Free includes, and what Premium adds"
        align="left"
        narrow
        background="muted"
      >
        <CompanyProse>
          <p>

            <Trans message="Keekii Free carries advertising, which is what pays for the service and keeps it free. Premium removes the ads and adds the features that cost us money to deliver -- higher audio quality, unlimited skips, offline listening without a cap and the creator-cleared catalogue." />

            </p>
          <p>

            <Trans message="Both plans play the same music from the same catalogue. The difference is the experience around it, not the size of the library." />

            </p>
          <p>
            The{' '}
            <Link to="/plans" className="underline underline-offset-4">
              plans page
            </Link>{' '}
            sets out exactly what each one includes, and{' '}
            <Link to="/pricing" className="underline underline-offset-4">
              current pricing
            </Link>{' '}
            is where the live prices live.
          </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="Being honest about the ads" tone="primary">
          <p>
            Keekii Free shows advertising. Ads never appear in a Premium session,
            and they are not allowed into the player in a way that stops you
            listening -- if an ad interrupted playback, it would cost us more
            listeners than it earns.
          </p>
          <p>
            If you would rather not see ads at all, Premium is the way to remove
            them, and Premium also funds more free accounts for everyone else.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="Practical questions about the mobile app."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Is the app really free?',
              answer:
                'Yes. Keekii Free is a permanent plan, not a trial. Nothing in it expires and nothing is held back behind a paywall.',
            },
            {
              question: 'Do I need a Premium plan to use the app?',
              answer:
                'No. The app works fully on Keekii Free. Premium removes advertising and adds the paid features, but it is not required to listen.',
            },
            {
              question: 'Can I use the app offline?',
              answer:
                'Yes, download music for offline listening. Downloads use device storage, and the size depends on the audio quality you choose.',
            },
            {
              question: 'Will my playlists follow me between app and web?',
              answer:
                'Yes. They are on your account, not on your device, so the same playlists appear on every client you sign in to.',
            },
            {
              question: 'Does it work on a slow connection?',
              answer:
                'Yes. There is a low-data mode that reduces the bitrate, and downloads can be limited to Wi-Fi so they do not eat a metered plan.',
            },
            {
              question: 'Why is there no Windows or desktop app?',
              answer:
                'The web player covers desktop and is built to work in any modern browser. A dedicated desktop app is not something we are working on.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Get Keekii in your pocket"
        description="Free to download, free to use, and the same account you already have."
        actions={[
          {label: 'Get the app', to: '/download'},
          {label: 'See Keekii plans', to: '/plans'},
        ]}
      />

      <p className="pb-10 text-center text-sm text-muted-foreground">
        <QrCodeIcon className="mr-1.5 inline size-4" />
        <Trans message="Prefer a QR code? Open this page on your computer and scan it with your phone." />
      </p>
    </CompanyPageLayout>
  );
}