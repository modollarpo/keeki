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
      path="/terms"
      title="Terms of Use"
      lead="The agreement between you and Keekii when you use the service. What we provide, what you agree not to do, what happens if something goes wrong, and how either side can end it."
      updated="1 October 2026"
    >
      <LegalNote>
        <Trans message="By creating a Keekii account or using the service you accept these terms. If you do not accept them, do not create an account. Keekii is a product of Storegrill Inc Ltd, registered in England and Wales." />
      </LegalNote>

      <LegalSection id="the-agreement" title="1. The agreement">
        <p>
          <Trans message="These terms apply to your use of the Keekii website, apps and API. They also apply to anyone using the service on your behalf, and you are responsible for what they do." />
        </p>
        <p>
          <Trans message="We may update these terms. If a change is material we will tell you before it takes effect, and where the law allows us to do so we will ask you to accept it. Continuing to use Keekii after a change takes effect means you accept the updated terms." />
        </p>
        <p>
          <Trans message="You must be old enough to enter a contract in your country, and at least 13 years old. If you are between 13 and 18, or the age of majority where you live is higher, you need a parent or guardian to accept these terms for you." />
        </p>
      </LegalSection>

      <LegalSection id="the-service" title="2. The service">
        <p>
          <Trans message="Keekii is a music streaming service. We give you access to a catalogue of music, podcasts and lyrics, the ability to create playlists and follow others, and, on paid plans, additional features. We add, remove and change things as the service develops." />
        </p>
        <p>
          <Trans message="Subscriptions are billed through our payment providers. Prices, billing periods and what each plan includes are shown at checkout. We will tell you before any price change affects your next payment, and you can cancel at any time from billing settings." />
        </p>
        <p>
          <Trans message="Keekii Free carries advertising. Paid plans do not. Advertising is described in the About Ads document; how we handle data is described in the Privacy Policy." />
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="3. Accounts">
        <LegalSubSection title="Keeping your account secure">
          <p>
            <Trans message="You are responsible for what happens under your account, so keep your password to yourself. Use a unique password, turn on two-factor authentication, and sign out of sessions you no longer use. You can review and end active sessions from account settings." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="One person, one account">
          <p>
            <Trans message="Create one account. Extra accounts to share a subscription, rotate through free-tier limits, or vote more than once are not permitted and we will close them." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Closing your account">
          <p>
            <Trans message="You can close your account from account settings at any time. Closing it deletes your account data permanently, along with your playlists, custom pages and uploaded files. There is no recovery window, so export anything you want to keep first." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="What we can do to an account">
          <p>
            <Trans message="We may suspend or close an account that breaches these terms, infringes someone else's rights, or is being used to cause harm to other people or to Keekii. Where the breach is minor and fixable we will usually tell you first and give you a chance to put it right. Impersonating an artist, rights holder or listener, or asking listeners to send payment details off-platform, is not a minor matter." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="your-content" title="4. Your content and what we do with it">
        <p>
          <Trans message="You keep ownership of everything you upload to Keekii: your recordings, artwork, lyrics and other material. Nothing here transfers your copyright to us." />
        </p>
        <p>
          <Trans message="You give us a licence to host, store, transmit, display and make your content available on Keekii, and to make the technical changes needed to deliver it, such as encoding for streaming. That licence is non-exclusive, royalty-free, and limited to running and operating the service. It ends when you close your account or remove the content, apart from copies that must be kept for legal reasons." />
        </p>
        <p>
          <Trans message="You confirm you have the right to upload what you upload, and that doing so does not infringe anyone else's rights. Uploading music you do not own or control is the most common way accounts get closed here." />
        </p>
        <LegalNote>
          <Trans message="Artists and rights holders: royalties are reported per your artist profile, and the terms for those arrangements are in your distribution agreement rather than in these terms. This document covers your use of Keekii as a listener and as an uploader." />
        </LegalNote>
      </LegalSection>

      <LegalSection id="acceptable-use" title="5. Acceptable use">
        <p>
          <Trans message="You agree not to use Keekii to do any of the following:" />
        </p>
        <ul>
          <li>
            <Trans message="Upload, stream or distribute content you do not have the right to use." />
          </li>
          <li>
            <Trans message="Circumvent, scrape, overload, probe or interfere with the service, its security, or the accounts of other people." />
          </li>
          <li>
            <Trans message="Redistribute the catalogue outside Keekii, including through automated bulk downloading or unlicensed public rebroadcast." />
          </li>
          <li>
            <Trans message="Harass, threaten, stalk or defraud anyone, or impersonate a person, artist or Keekii employee." />
          </li>
          <li>
            <Trans message="Upload unlawful material, exploit content involving children, or encourage self-harm or violence." />
          </li>
          <li>
            <Trans message="Use the service where doing so would breach the law of your country." />
          </li>
        </ul>
        <p>
          <Trans message="We enforce this by removing content, suspending accounts and, where the conduct is criminal, reporting it. We do not remove content because we disagree with it." />
        </p>
      </LegalSection>

      <LegalSection id="reports-and-complaints" title="6. Reports and complaints">
        <p>
          <Trans message="Report content that is unlawful, that exploits a person, or that promotes abuse, and we will review it. Reports are assessed by a person." />
        </p>
        <p>
          <Trans message="Copyright and rights complaints follow a separate formal process, because they carry their own legal protections. Submit them through the artist rights channel so the claim is properly recorded." />
        </p>
        <p>
          <Trans message="If you believe we removed something wrongly, or made a mistake about your account, tell us. We will look again. Where the law gives you a formal route of appeal we will tell you what it is." />
        </p>
      </LegalSection>

      <LegalSection id="availability" title="7. Availability and changes">
        <p>
          <Trans message="We work to keep Keekii running, but we do not promise it will never be interrupted. Planned maintenance, network failures and events outside our control can all cause downtime. We do not offer a service level agreement or uptime commitment on consumer plans." />
        </p>
        <p>
          <Trans message="We may add, change, suspend or withdraw features. Where a change removes something you have paid for, we will tell you and give you the option to cancel and be refunded for the unused remainder of your billing period." />
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="8. Third parties">
        <p>
          <Trans message="Keekii links to other sites and lets you share to them. We do not control them and are not responsible for their content, privacy practices or availability. Following a link to another service is your decision and those services have their own terms." />
        </p>
        <p>
          <Trans message="Some features are provided by third parties, including payment processing, hosting and content delivery. Your use of those features is also governed by their terms." />
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="9. Disclaimers">
        <p>
          <Trans message="Keekii is provided on an as-is and as-available basis. To the fullest extent the law allows, we disclaim implied warranties of merchantability, fitness for a particular purpose, non-infringement and uninterrupted availability." />
        </p>
        <p>
          <Trans message="We do not guarantee that the service will be error-free, that content will always be available, or that lyrics and metadata are complete or perfectly accurate." />
        </p>
      </LegalSection>

      <LegalSection id="liability" title="10. Liability">
        <p>
          <Trans message="Nothing in these terms limits our liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited." />
        </p>
        <p>
          <Trans message="Subject to that, we are not liable for indirect or consequential loss, and for direct loss our total liability is limited to the greater of the amount you paid us in the twelve months before the claim, or fifty pounds. We are not liable for lost profits, lost data, or loss of goodwill." />
        </p>
        <p>
          <Trans message="You are responsible for your own backups. If you rely on data stored in your Keekii account, keep your own copy of anything you cannot afford to lose." />
        </p>
        <LegalNote>
          <Trans message="Consumer law gives you rights these terms cannot take away, including your right to reject faulty goods and services. If you are a consumer, the limits above do not apply to anything you are entitled to under that law." />
        </LegalNote>
      </LegalSection>

      <LegalSection id="indemnity" title="11. Indemnity">
        <p>
          <Trans message="You agree to indemnify us against claims, losses and costs arising from your material breach of these terms, your infringement of someone else's rights, or your unlawful use of the service." />
        </p>
      </LegalSection>

      <LegalSection id="changes-termination" title="12. Ending the agreement">
        <p>
          <Trans message="You can stop using Keekii and close your account at any time. We can suspend or end the agreement as set out in section 3, or where we are required to by law." />
        </p>
        <p>
          <Trans message="If you close your account you lose access immediately. Your billing stops at the end of the period you have already paid for, and we do not refund the remainder unless we said otherwise when you bought it, or the law says we must." />
        </p>
        <p>
          <Trans message="Clauses that by their nature should survive termination do survive it, including liability, indemnity, and anything else that by its nature is intended to continue." />
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="13. Governing law and disputes">
        <p>
          <Trans message="These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction. If you live elsewhere, you keep any mandatory rights you have under the law of your country." />
        </p>
        <p>
          <Trans message="Before starting proceedings, please write to us and give us a reasonable chance to resolve the problem. Most disputes are a misunderstanding we can fix, and we would rather fix it than have it escalate." />
        </p>
        <p>
          <Trans message="If you are a consumer in the EU or UK and we cannot resolve it, you may use the European Commission's online dispute resolution platform." />
        </p>
      </LegalSection>

      <LegalSection id="general" title="14. General">
        <p>
          <Trans message="If any part of these terms is found unenforceable, the rest still applies. Failing to enforce a clause is not a waiver of it. You may not assign your account to someone else; we may provide the service through affiliated companies." />
        </p>
        <p>
          <Trans message="If we provide you with notices, email and in-app messages count as delivered. Keep your contact details current so we can reach you about your account." />
        </p>
      </LegalSection>

      <LegalSection id="related" title="Related documents">
        <ul>
          <li>
            <Link to="/privacy-policy" className="underline underline-offset-4">
              <Trans message="Privacy Policy" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="what we hold about you, why, and for how long." />
          </li>
          <li>
            <Link to="/cookies" className="underline underline-offset-4">
              <Trans message="Cookies" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="the cookies behind the service and how to control them." />
          </li>
          <li>
            <Link to="/about-ads" className="underline underline-offset-4">
              <Trans message="About Ads" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="what advertising does and does not see." />
          </li>
          <li>
            <Link to="/gdpr" className="underline underline-offset-4">
              <Trans message="GDPR" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="how to exercise your data rights." />
          </li>
          <li>
            <Link to="/legal" className="underline underline-offset-4">
              <Trans message="Safety & Privacy Center" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="the index of all of the above." />
          </li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}