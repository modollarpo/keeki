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
      path="/privacy-policy"
      title="Privacy Policy"
      lead="What personal data Keekii collects, the lawful basis we rely on, how long we keep it, who we share it with, and the rights you have over it."
      updated="1 October 2026"
    >
      <LegalNote>
        <Trans message="This policy applies to music.keekii.net, the Keekii mobile apps and the Keekii API. Keekii is a product of Storegrill Inc Ltd, registered in England and Wales, which is the data controller described here." />
      </LegalNote>

      <LegalSection id="scope" title="1. Who this applies to">
        <p>
          <Trans message="This policy covers anyone who uses Keekii: listeners on Keekii Free and Premium, artists and rights holders, creators, advertisers, developers integrating the API, and visitors who do not sign in." />
        </p>
        <p>
          <Trans message="It does not cover third-party sites we link to, or services we integrate with where you have a separate relationship with them. Where we pass data to a processor, that processor's own policy applies to them as well." />
        </p>
      </LegalSection>

      <LegalSection id="what-we-collect" title="2. What we collect">
        <LegalSubSection title="Account data">
          <p>
            <Trans message="Email address, display name, password hash, avatar, country and interface language, account creation date, and verification status. If you sign in with a third-party identity provider we receive the identifier that provider gives us, not your password." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Listening and library data">
          <p>
            <Trans message="What you play, when, for how long, what you skip, what you like, your playlists, your library, your follows, your search history and your listening history. This is the data that makes recommendations, radio and country charts work at all." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Billing data">
          <p>
            <Trans message="Your plan, its price, its currency, its renewal date and its status. Full card numbers are handled by our payment processors and never reach our servers, so we store only a token, the processor's reference and the last four digits for display." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Content you give us">
          <p>
            <Trans message="For artists and rights holders: audio files, artwork, release metadata, lyrics, split sheets, rights documentation and royalty statements. For creators: the licence records you keep against your projects." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Device and technical data">
          <p>
            <Trans message="IP address, user agent, device model, operating system, app version, browser language, screen size, and crash and error logs. We use this to keep the service running and to find out what is broken." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Communications">
          <p>
            <Trans message="Messages you send us through the contact form or by email, including support history. We keep them because they are the record of what we were told and what we did about it." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="What we do not collect">
          <p>
            <Trans message="We do not build advertising profiles of individual listeners, we do not sell personal data, and we do not collect special-category data about health, politics, religion, sex life or sexual orientation. We ask for a date of birth only where a plan's eligibility rules require it, and we do not store it beyond verifying the rule." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="lawful-basis" title="3. Why we are allowed to">
        <p>
          <Trans message="Under the UK and EU data protection framework, each use of your data needs a lawful basis. Ours are:" />
        </p>
        <ul>
          <li>
            <strong>
              <Trans message="Contract." />
            </strong>{' '}
            <Trans message="To run your account, play the music, process your subscription and deliver the features your plan includes. Without this, there is no Keekii account." />
          </li>
          <li>
            <strong>
              <Trans message="Legitimate interests." />
            </strong>{' '}
            <Trans message="To secure the service, prevent fraud and abuse, understand which features work, aggregate and publish country and genre charts, and improve search and recommendations. We balance these against your interests and we do not use them to build advertising profiles." />
          </li>
          <li>
            <strong>
              <Trans message="Consent." />
            </strong>{' '}
            <Trans message="For non-essential cookies, for marketing email, and for optional analytics. You can withdraw consent at any time without affecting your account." />
          </li>
          <li>
            <strong>
              <Trans message="Legal obligation." />
            </strong>{' '}
            <Trans message="To keep accounting records, respond to lawful requests from authorities, and meet tax and consumer law requirements." />
          </li>
          <li>
            <strong>
              <Trans message="Vital interests." />
            </strong>{' '}
            <Trans message="In the rare case where processing is necessary to protect someone's life, for example during a security incident affecting an account holder." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="sharing" title="4. Who we share data with">
        <p>
          <Trans message="We share personal data with four kinds of organisation, and never sell it to anyone:" />
        </p>
        <ul>
          <li>
            <strong>
              <Trans message="Payment processors." />
            </strong>{' '}
            <Trans message="To take a subscription payment and handle refunds. They act as independent controllers for fraud prevention and as our processor for the charge itself." />
          </li>
          <li>
            <strong>
              <Trans message="Infrastructure and delivery providers." />
            </strong>{' '}
            <Trans message="Hosting, object storage, content delivery, search indexing, email delivery, crash reporting and error monitoring. They process data on our instructions under written contracts." />
          </li>
          <li>
            <strong>
              <Trans message="Music rights and collection organisations." />
            </strong>{' '}
            <Trans message="To report and collect performance and mechanical royalties for artists, authors and publishers. This is required to pay people correctly." />
          </li>
          <li>
            <strong>
              <Trans message="Advertising partners." />
            </strong>{' '}
            <Trans message="Only for campaigns on Keekii Free, only the aggregate and campaign-level data described in About Ads, and never a profile of an individual listener." />
          </li>
        </ul>
        <p>
          <Trans message="We also disclose data where the law requires it, to a valid authority, and where necessary to establish or defend legal claims. If we are asked to hand over a UK or EU user's data on a formal request, we assess the request's validity first and tell the affected user unless we are legally prohibited from doing so." />
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="5. International transfers">
        <p>
          <Trans message="Keekii is operated from the United Kingdom, and some of our providers process data in other countries. Where personal data leaves the UK or the EEA, we rely on adequacy regulations where they exist and on standard contractual clauses with a transfer risk assessment where they do not. We keep the list of transfer destinations and the safeguards applied, and we will tell you which country your data is in if you ask." />
        </p>
      </LegalSection>

      <LegalSection id="retention" title="6. How long we keep it">
        <LegalSubSection title="Account data">
          <p>
            <Trans message="For as long as your account is open, and for 30 days after you close it, after which we delete it. A short window exists so a mistaken deletion can be undone." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Listening data">
          <p>
            <Trans message="While your account is open, and in aggregated form for up to 24 months afterwards for chart and trend calculation. Aggregated statistics cannot be traced back to you." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Billing records">
          <p>
            <Trans message="Seven years, because tax law requires it. This is a legal obligation, not a choice." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Technical and security logs">
          <p>
            <Trans message="Up to 12 months, or longer where a specific incident is under investigation." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Backups">
          <p>
            <Trans message="Deleted data is removed from encrypted backups within 35 days, after which it can no longer be restored from them." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Support correspondence">
          <p>
            <Trans message="24 months from the last contact, unless the message is part of a rights, billing or safety dispute, in which case we keep it until that matter is closed." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="security" title="7. Security">
        <p>
          <Trans message="Data is encrypted in transit and at rest, passwords are stored as salted adaptive hashes rather than reversibly, administrative access is limited and logged, and access to production data for support is logged and time-bound. No system is perfectly secure, which is why we publish rather than imply." />
        </p>
        <p>
          <Trans message="We do not require you to give us your password, your full card number or your identity documents in order to help you. If we need to verify something, we will send you to a channel that can carry it safely." />
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="8. Your rights">
        <p>
          <Trans message="Subject to the law that applies to you, you can:" />
        </p>
        <ul>
          <li>
            <Trans message="Ask what personal data we hold about you, and get a copy (access)." />
          </li>
          <li>
            <Trans message="Ask us to correct data that is wrong or incomplete (rectification)." />
          </li>
          <li>
            <Trans message="Ask us to delete data where we have no overriding reason to keep it (erasure)." />
          </li>
          <li>
            <Trans message="Ask us to limit how we use your data while a dispute is resolved (restriction)." />
          </li>
          <li>
            <Trans message="Receive your data in a portable, machine-readable format (portability)." />
          </li>
          <li>
            <Trans message="Object to processing based on legitimate interests, and to direct marketing (objection)." />
          </li>
          <li>
            <Trans message="Withdraw consent, where consent is the basis we are using." />
          </li>
        </ul>
        <p>
          <Trans message="There is no charge for exercising a right. We respond within one month, and we will tell you promptly if a request is complex enough that it genuinely needs longer, with a reason. Do not send identity documents with a request unless we specifically ask for them." />
        </p>
      </LegalSection>

      <LegalSection id="children" title="9. Children">
        <p>
          <Trans message="Keekii is not directed at children under 13 and we do not knowingly collect their personal data. If you believe a child has created an account, contact us and we will delete it and any data associated with it." />
        </p>
      </LegalSection>

      <LegalSection id="automated-decisions" title="10. Automated decisions">
        <p>
          <Trans message="Recommendations, radio and charts are produced by automated systems. They affect what you are shown, not what we charge you, and they do not produce legal or similarly significant effects. You can start a session from anything in the catalogue rather than accepting a generated sequence, and you can clear your listening history to reset what those systems know about your taste." />
        </p>
      </LegalSection>

      <LegalSection id="your-content" title="11. Your content and rights">
        <p>
          <Trans message="You keep ownership of the audio, compositions, artwork, lyrics and metadata you upload. Submitting a catalogue to Keekii grants us the licence set out in the agreement -- to host, stream and make it available -- and nothing more. We do not claim ownership of your work, and we do not use it to train generative models." />
        </p>
        <p>
          <Trans message="Listenership data about your catalogue is shared with you, and, where you are entitled to it, passed to your publisher or collection society. What we do not do is sell it, or hand individual listener identities to anyone." />
        </p>
      </LegalSection>

      <LegalSection id="changes" title="12. Changes to this policy">
        <p>
          <Trans message="When this policy changes materially we will tell you in the app and by email before the change takes effect, and we will keep the previous version available on request. Corrections that do not change our practices do not get a notice." />
        </p>
      </LegalSection>

      <LegalSection id="contact" title="13. Contact">
        <p>
          <Trans message="Write to" />{' '}
          <a href="mailto:privacy@music.keekii.net">privacy@music.keekii.net</a>{' '}
          <Trans message="or use the contact form with the subject Privacy. Keekii is a product of Storegrill Inc Ltd, registered in England and Wales." />
        </p>
        <p>
          <Trans message="If you are in the EEA or the UK and believe we have handled your data badly, you can complain to your local supervisory authority. We would rather hear from you first, because we can usually put it right faster than a regulator can." />
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}