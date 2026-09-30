import {Link} from 'react-router';
import {Trans} from '@ui/i18n/trans';
import {
  LegalNote,
  LegalPageLayout,
  LegalSection,
  LegalSubSection,
} from '../legal-page-layout';

export function Component() {
  return (
    <LegalPageLayout
      path="/about-ads"
      title="About Ads on Keekii"
      lead="Keekii Free carries advertising because it is what keeps the service free. Here is exactly how that advertising works, what we will not do with it, and what changes when you subscribe."
      updated="1 October 2026"
    >
      <LegalNote>
        <Trans message="The short version: ads pay for Keekii Free, ads never appear in a Premium session, and buying an ad never buys a better chart position or a higher search result." />
      </LegalNote>

      <LegalSection id="why-ads" title="Why there are ads at all">
        <p>
          <Trans message="Keekii is a product of Storegrill Inc Ltd, registered in England and Wales. Charging every listener a subscription would exclude most of the people the service exists for, in the markets it exists for. Advertising is how the majority of listeners get to use Keekii without paying anything, so we would rather have advertisers than have a wall." />
        </p>
        <p>
          <Trans message="Advertising is also why the catalogue is open. If the free tier were funded by subscriptions alone, the obvious pressure would be to shrink what free users can hear. Funding it with ads lets us keep the whole catalogue available to everyone." />
        </p>
      </LegalSection>

      <LegalSection id="where-ads-appear" title="Where ads appear">
        <LegalSubSection title="On Keekii Free">
          <ul>
            <li>
              <Trans message="Audio spots between tracks, at the start of a session, and in radio." />
            </li>
            <li>
              <Trans message="Display units above and below the player, and alongside channel content." />
            </li>
            <li>
              <Trans message="Video pre-roll and mid-roll inside the app and on the web, produced for sound-off as well as sound-on viewing." />
            </li>
          </ul>
        </LegalSubSection>
        <LegalSubSection title="On Premium">
          <p>
            <Trans message="Never. Advertising does not run inside a Premium session, on any plan, in any market. This is part of what you are paying for, and it is enforced on the server rather than in the interface." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Around the player">
          <p>
            <Trans message="An ad must never stop playback, skip a track the listener chose, or interrupt a download. If an ad that interrupts listening ever reaches the free player, it is a bug, and we would rather hear about it than defend it." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="what-advertisers-get" title="What an advertiser can see">
        <LegalSubSection title="What is measured">
          <p>
            <Trans message="Campaigns are measured on delivery: impressions, viewability where it can be measured, clicks, plays, completions, and the segments the campaign was configured to reach. Impressions are deduplicated, and figures are reported as measured rather than modelled up." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="What is targeted">
          <p>
            <Trans message="Targeting is coarse on purpose: market, language, age bracket and genre affinity. You can buy a campaign for listeners in Ghana who show affinity for highlife. You cannot buy an individual listener." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="What is never shared">
          <ul>
            <li>
              <Trans message="Your account email address, your name, or your payment details." />
            </li>
            <li>
              <Trans message="A list of the tracks you have played, or your listening history." />
            </li>
            <li>
              <Trans message="Your identity alongside a specific page view, unless you interacted with that advertiser yourself." />
            </li>
            <li>
              <Trans message="Anything about an account that is on a Premium plan." />
            </li>
          </ul>
        </LegalSubSection>
        <LegalSubSection title="Aggregate statistics">
          <p>
            <Trans message="Advertisers receive aggregated reporting, not per-listener records. Where counts are small enough that a figure could identify a person, we suppress or widen them rather than publish them." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="what-we-will-not-do" title="What we will not do">
        <LegalSubSection title="No pay-to-rank">
          <p>
            <Trans message="Money does not change search results, editorial playlists, country charts or genre charts. Those rankings are computed from listening, not from invoices. A playlist we choose is not a slot someone bought." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="No data brokerage">
          <p>
            <Trans message="We do not sell audience segments, append advertising identifiers to your account, or license your listening behaviour to a third party. If we ever wanted to, the argument would have to be made publicly, and right now it does not survive contact with the reason Keekii exists." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="No behavioural advertising based on listening">
          <p>
            <Trans message="We do not build an advertising profile out of what you listen to. Genre affinity for campaign targeting is derived from aggregate behaviour, not from your personal history attached to an identifier." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="No ads in Premium">
          <p>
            <Trans message="There is no format, market or campaign type that buys placement inside a Premium session." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="No certain categories">
          <p>
            <Trans message="We decline categories whose brand would be unwelcome in the room. The list is in the rate card, and we will say so before you brief an agency rather than after the campaign is live." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="measurement-and-transparency" title="Measurement and transparency">
        <p>
          <Trans message="Advertiser figures reconcile against Keekii's own measurement. If the numbers in a report do not agree, we would rather investigate than argue about whose attribution is right. Campaign review happens before delivery, and creative that needs work is flagged rather than quietly allowed through." />
        </p>
        <p>
          <Trans message="Cookies and similar storage used by advertising are described in detail on the Cookies page, and you can withdraw consent for non-essential advertising storage at any time." />
        </p>
        <p>
          <Link to="/cookies" className="underline underline-offset-4">
            <Trans message="Read the cookies document" />
          </Link>
        </p>
      </LegalSection>

      <LegalSection id="your-choices" title="Your choices">
        <ul>
          <li>
            <strong>
              <Trans message="Remove ads:" />
            </strong>{' '}
            <Trans message="any Premium plan removes them entirely, and funds free accounts for other listeners." />
          </li>
          <li>
            <strong>
              <Trans message="Decline advertising storage:" />
            </strong>{' '}
            <Trans message="do it in your browser, in Keekii's privacy settings, or through your browser's Do Not Track or Global Privacy Control signal. The service keeps working." />
          </li>
          <li>
            <strong>
              <Trans message="Complain:" />
            </strong>{' '}
            <Trans message="if you believe a campaign on Keekii broke one of the commitments on this page, tell us and we will act on it." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="advertise" title="Advertising with Keekii">
        <p>
          <Trans message="Campaigns are sold directly and through programmatic partners. There is no self-serve funnel; send a brief with your markets, formats and flight dates and you will get a rate card and an availability sheet back." />
        </p>
        <p>
          <Link to="/advertising" className="underline underline-offset-4">
            <Trans message="Go to the advertising page" />
          </Link>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
