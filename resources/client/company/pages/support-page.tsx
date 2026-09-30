import {
  BookOpenIcon,
  BugIcon,
  CreditCardIcon,
  HeadphonesIcon,
  LifeBuoyIcon,
  MessageCircleIcon,
  ShieldQuestionIcon,
  UserRoundIcon,
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

const topics = [
  {
    icon: HeadphonesIcon,
    title: 'Playback and audio',
    description:
      'A track that will not play, buffering, a wrong version, or a gap in the catalogue.',
    to: '/contact',
  },
  {
    icon: UserRoundIcon,
    title: 'Account and login',
    description:
      'Cannot sign in, cannot reset a password, cannot verify an email, wrong plan showing on an account.',
    to: '/contact',
  },
  {
    icon: CreditCardIcon,
    title: 'Billing and plans',
    description:
      'Charges, renewals, refunds, cancelling a plan, or a payment method that has expired.',
    to: '/contact',
  },
  {
    icon: ShieldQuestionIcon,
    title: 'Copyright and claims',
    description:
      'A video muted, a stream stopped, or a track you believe is wrongly attributed or mis-lyriced.',
    to: '/contact',
  },
  {
    icon: BugIcon,
    title: 'Bugs and broken pages',
    description:
      'Something on the site is not working. A screenshot and the browser you are using is usually enough.',
    to: '/contact',
  },
  {
    icon: MessageCircleIcon,
    title: 'Everything else',
    description:
      'Feedback, a correction, a partnership, a press question, or a subject we have not thought to list here.',
    to: '/contact',
  },
];

const beforeYouWrite = [
  {
    title: 'Your account email',
    description:
      'The address on the account. It is the only thing that lets us find your account without asking you for anything sensitive.',
  },
  {
    title: 'What you were doing',
    description:
      'The page, the player, the action. A link or a screenshot beats a description of the problem.',
  },
  {
    title: 'The track, release or page',
    description:
      'A link to the thing itself. If it is a track, include the release and the version.',
  },
  {
    title: 'Your browser and device',
    description:
      'Browser and version, operating system, and whether it happens on your phone as well as on the web.',
  },
  {
    title: 'What you expected, and what happened',
    description:
      'Both halves. Half the reports we receive are the same bug; knowing the expectation saves a round trip.',
  },
  {
    title: 'Screenshots or a screen recording',
    description:
      'Especially for layout and playback problems, where words are a poor substitute for what you saw.',
  },
];

export function Component() {
  return (
    <CompanyPageLayout
      path="/support"
      title="Get help from Keekii"
      lead="Support on Keekii is handled by people who can look at your account. There is no bot loop to get out of, and no ticket number to quote."
      actions={[
        {label: 'Contact support', to: '/contact'},
        {label: 'Read For the Record', to: '/for-the-record'},
      ]}
    >
      <CompanySectionBlock
        title="Start here"
        description="Most problems are in one of these six places. Pick the closest one and you will reach the right team."
      >
        <CompanyFeatureGrid columns={3} features={topics} />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Before you write"
        description="Six things that make a first reply actually solve the problem."
        align="left"
        narrow
        background="muted"
      >
        <CompanyProse>
          <ol>
          {beforeYouWrite.map(item => (
            <li key={item.title}>
              <strong>{item.title}.</strong>{' '}
              <Trans message={item.description} />
            </li>
          ))}
          </ol>
          <p>
            <Trans message="Please do not send passwords, full payment card numbers, or identity documents through the contact form. If we need to verify something, we will tell you exactly what through a secure channel." />
          </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="What to expect from us"
        align="left"
        narrow
      >
        <CompanyProse>
          <h2>
<Trans message="Response times" />
</h2>
          <p>

            <Trans message="Keekii support is staffed across multiple time zones, including Africa and Europe, because our listeners are. We aim to acknowledge most messages within one working day. Copyright and payment disputes take longer because they involve third parties, and we will say so rather than let you wait in silence." />

            </p>

          <h2>
<Trans message="What happens with your message" />
</h2>
          <p>

            <Trans message="It reaches a person who can see your account and the relevant catalogue records. We do not need you to explain what a Keekii is or how the player works, and we will not ask you to re-describe a problem you have already described." />

            </p>

          <h2>
<Trans message="When we cannot fix it" />
</h2>
          <p>

            <Trans message="Sometimes the answer is that something is not ours to change -- a rights holder's decision, a third-party platform's policy, a bank. We will say that plainly, explain what your options are, and not leave you guessing." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="Self-service first" tone="primary">
          <p>
            Some things are faster to fix yourself. If you cannot sign in, a
            password reset is the first thing to try. If a payment failed, the
            billing page will show the attempt and let you retry. If a video of
            yours was muted, the track page shows its licence state, which is
            usually the whole answer.
          </p>
          <p>
            Everything else, write to us. We would rather have the message than
            have you stuck.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Still useful while you wait"
        description="Pages that answer more than they were written to."
        background="muted"
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: BookOpenIcon,
              title: 'For the Record',
              description:
                'Every commitment Keekii makes, in one page, including the awkward ones.',
              to: '/for-the-record',
            },
            {
              icon: ShieldQuestionIcon,
              title: 'For Artists',
              description:
                'How royalties, catalogue and content claims work for rights holders.',
              to: '/artists',
            },
            {
              icon: LifeBuoyIcon,
              title: 'Keekii plans',
              description:
                'What each plan includes, and what changes between them.',
              to: '/plans',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Talk to a person"
        description="Send what you have. It does not need to be a complete report to get a useful answer."
        actions={[
          {label: 'Contact support', to: '/contact'},
          {label: 'Read about Keekii', to: '/about'},
        ]}
      />

      <p className="pb-10 text-center text-sm text-muted-foreground">
        <Trans message="Already know what it is? The API reference is public and does not need a login." />{' '}
        <Link to="/api-docs" className="underline underline-offset-4">
          <Trans message="Read the API reference" />
        </Link>
      </p>
    </CompanyPageLayout>
  );
}