import {
  Building2,
  GraduationCap,
  Sparkles,
  Users,
  UserRound,
} from 'lucide-react';

export type PlanSlug =
  | 'premium-individual'
  | 'premium-duo'
  | 'premium-family'
  | 'premium-student'
  | 'keekii-free';

export type PlanDefinition = {
  slug: PlanSlug;
  /** Footer label, and the name used in the site map. */
  label: string;
  /** Marketing name, used in headings and card titles. */
  name: string;
  /** One line for the plan card and the /plans comparison. */
  summary: string;
  /** Longer positioning statement for the plan's own page. */
  tagline: string;
  audience: string;
  seats: string;
  /** Highlighted on /plans as the plan most people pick. */
  recommended?: boolean;
  icon: typeof Sparkles;
  benefits: string[];
  included: string[];
  idealFor: string[];
  faq: {question: string; answer: string}[];
};

/**
 * Marketing copy for the five Keekii plans.
 *
 * Deliberately holds no prices. Live pricing and checkout come from the product
 * records in the database and are rendered by `/pricing`, so this copy cannot
 * drift out of step with what a listener is actually charged.
 */
export const plans: PlanDefinition[] = [
  {
    slug: 'keekii-free',
    label: 'Keekii Free',
    name: 'Keekii Free',
    summary:
      'Listen to the whole catalogue for nothing, with a small amount of advertising.',
    tagline:
      'The whole of Keekii, for nothing. No card, no commitment, no end date.',
    audience: 'Everyone',
    seats: '1 account',
    icon: Sparkles,
    benefits: [
      'The full Keekii catalogue across every genre',
      'Playlists, channels and personalised recommendations',
      'Lyrics on every track that has them',
      'Follow artists and build a library',
    ],
    included: [
      'Ad-supported listening',
      'Standard audio quality',
      'Online playback only',
      'One account',
    ],
    idealFor: [
      'Listening on a shared or secondary device',
      'Trying Keekii before paying for anything',
      'Keeping an eye on what is new without spending',
    ],
    faq: [
      {
        question: 'Is Keekii Free really free?',
        answer:
          'Yes. There is no trial period and no card is required. Keekii Free is a permanent plan, not a countdown to a subscription.',
      },
      {
        question: 'What does Premium add?',
        answer:
          'Premium removes advertising, raises the audio quality, unlocks offline downloads and adds the listening tools that most subscribers use daily.',
      },
      {
        question: 'Can I move to Premium later without losing anything?',
        answer:
          'Yes. Your library, playlists and followed artists stay exactly where they are. Upgrading only changes what you pay and what you get.',
      },
    ],
  },
  {
    slug: 'premium-individual',
    label: 'Premium Individual',
    name: 'Keekii Premium Individual',
    summary:
      'One account, ad-free, offline, at the highest audio quality.',
    tagline:
      'One account, nothing in the way. The plan most people on Keekii have.',
    audience: 'One person',
    seats: '1 account',
    recommended: true,
    icon: UserRound,
    benefits: [
      'Ad-free listening, everywhere',
      'Offline downloads on up to 5 devices',
      'Highest audio quality available',
      'Unlimited skips and no shuffle limits',
      'On-demand playback of anything you want',
    ],
    included: [
      'Everything in Keekii Free',
      'No advertising',
      'Offline downloads',
      'Highest audio quality',
      'Lyrics view',
    ],
    idealFor: [
      'One person who listens on a phone, a laptop and a speaker',
      'Commuters who need downloads rather than signal',
      'Anyone who has ever reached for the skip button and been told no',
    ],
    faq: [
      {
        question: 'How many devices can I use Premium Individual on?',
        answer:
          'Up to five devices, each of which can be signed in and downloading at the same time.',
      },
      {
        question: 'Can I share my login with someone else?',
        answer:
          'No. Individual is for one person. If more than one person in your household wants Premium, Duo or Family will serve you better.',
      },
      {
        question: 'Do I keep my downloads if I cancel?',
        answer:
          'No, downloads are tied to an active subscription. Your library and playlists are kept and become available again if you resubscribe.',
      },
    ],
  },
  {
    slug: 'premium-duo',
    label: 'Premium Duo',
    name: 'Keekii Premium Duo',
    summary:
      'Two separate accounts, one bill, full Premium on both.',
    tagline:
      'Two people, two accounts, one bill. No more sharing a password.',
    audience: 'Two people sharing a home',
    seats: '2 accounts',
    icon: Users,
    benefits: [
      'Two fully separate accounts',
      'Each person gets their own library and recommendations',
      'Ad-free listening and offline downloads on both',
      'Highest audio quality on both',
      'One monthly or annual payment',
    ],
    included: [
      'Everything in Premium Individual, twice',
      '2 separate accounts',
      'No advertising',
      'Offline downloads on both accounts',
      'Highest audio quality',
    ],
    idealFor: [
      'Couples or flatmates with different taste',
      'Anyone currently sharing one login',
      'Households where one person is a heavy listener and one is not',
    ],
    faq: [
      {
        question: 'Do both people have to live at the same address?',
        answer:
          'Duo is intended for two people in the same household, but Keekii does not verify addresses for the plan.',
      },
      {
        question: 'Can either account be used while travelling?',
        answer:
          'Yes. Both Duo accounts can be in use anywhere, which is one of the reasons Duo sits above a shared Individual login.',
      },
      {
        question: 'Can I move from Duo to Family?',
        answer:
          'Yes. Change plan from your account settings and the remaining balance is applied to the new plan.',
      },
    ],
  },
  {
    slug: 'premium-family',
    label: 'Premium Family',
    name: 'Keekii Premium Family',
    summary:
      'Up to six separate accounts, including one that can travel with you.',
    tagline:
      'Everyone in the house, each with their own account, one address to verify.',
    audience: 'Households',
    seats: 'Up to 6 accounts',
    icon: Building2,
    benefits: [
      'Up to six separate accounts',
      'One account can be used while travelling',
      'Everyone gets their own library and recommendations',
      'Ad-free listening and offline downloads throughout',
      'Highest audio quality throughout',
    ],
    included: [
      'Everything in Premium Individual, six times over',
      'Up to 6 separate accounts',
      '1 account available while travelling',
      'No advertising',
      'Offline downloads',
    ],
    idealFor: [
      'Families where everyone listens differently',
      'Anyone with a teenager and a parent on the same sofa',
      'Households that travel and still want their own account',
    ],
    faq: [
      {
        question: 'How does the travelling account work?',
        answer:
          'One of your six accounts can sign in and play outside your registered address. The other five stay at home.',
      },
      {
        question: 'What happens if someone moves out?',
        answer:
          'Remove them from your Family address in account settings and the slot frees up for someone else.',
      },
      {
        question: 'Can I combine Family with a student plan?',
        answer:
          'No. A Family address holds Premium Family accounts only. Students should take Premium Student directly.',
      },
    ],
  },
  {
    slug: 'premium-student',
    label: 'Premium Student',
    name: 'Keekii Premium Student',
    summary:
      'Full Premium for verified students, at a reduced rate.',
    tagline:
      'The same Premium as everybody else, priced for people who are still at it.',
    audience: 'Verified students',
    seats: '1 account',
    icon: GraduationCap,
    benefits: [
      'Everything in Premium Individual',
      'Reduced rate, for as long as you are eligible',
      'Ad-free listening and offline downloads',
      'Highest audio quality',
      'Re-verified each academic year',
    ],
    included: [
      'Everything in Premium Individual',
      'Student rate',
      'No advertising',
      'Offline downloads',
      'Highest audio quality',
    ],
    idealFor: [
      'School, college and university students',
      'Apprentices and anyone in full-time education',
      'Anyone who will need to re-verify every year',
    ],
    faq: [
      {
        question: 'Who qualifies?',
        answer:
          'Anyone currently enrolled at an eligible school, college or university. You need to be able to prove it.',
      },
      {
        question: 'How often do I have to re-verify?',
        answer:
          'Once every twelve months. We will remind you before your student rate expires.',
      },
      {
        question: 'What happens when I graduate?',
        answer:
          'You move to Premium Individual at the standard rate. Nothing about your library or playlists changes.',
      },
    ],
  },
];

export function getPlan(slug: PlanSlug): PlanDefinition {
  const plan = plans.find(item => item.slug === slug);
  if (!plan) {
    throw new Error(`[keekii] Unknown plan "${slug}". Add it to plans.`);
  }
  return plan;
}