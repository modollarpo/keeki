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
      path="/legal"
      title="Safety & Privacy Center"
      lead="One place for everything about how Keekii handles your data, your safety and your rights. If you are looking for a specific document, it is linked below and in the sidebar."
    >
      <LegalSection id="start-here" title="Start here">
        <p>
          <Trans message="Keekii is a product of Storegrill Inc Ltd, registered in England and Wales. We are the data controller for the personal data described in these documents. This page is the index; the documents themselves are the authoritative statement of our practices." />
        </p>
        <LegalNote>
          <Trans message="These pages describe how Keekii actually behaves. Where a practice is required by law we say so, and where it is our own choice we say that too." />
        </LegalNote>
      </LegalSection>

      <LegalSection id="documents" title="The documents">
        <ul>
          <li>
            <Link to="/terms">
              <Trans message="Terms of Use" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="what the service provides, what you agree not to do, and how either side can end the agreement." />
          </li>
          <li>
            <Link to="/privacy-policy">
              <Trans message="Privacy Policy" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="what we collect, why, how long we keep it and who we share it with." />
          </li>
          <li>
            <Link to="/cookies">
              <Trans message="Cookies" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="every cookie Keekii sets, what it does, and how to control or remove it." />
          </li>
          <li>
            <Link to="/about-ads">
              <Trans message="About Ads" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="how advertising works, why Keekii Free shows ads, and why Premium never does." />
          </li>
          <li>
            <Link to="/accessibility">
              <Trans message="Accessibility" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="the standard we build to, what we know is not there yet, and how to report a barrier." />
          </li>
          <li>
            <Link to="/gdpr">
              <Trans message="GDPR" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="how to exercise your rights of access, rectification, portability and erasure." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="your-controls" title="Your controls">
        <p>
          <Trans message="We would rather you changed something than filed a complaint. Most of what people contact us about can be changed directly:" />
        </p>
        <ul>
          <li>
            <strong>
              <Trans message="Export your data." />
            </strong>{' '}
            <Trans message="Request a machine-readable copy of your account and listening data at any time by writing to us. We do not charge for it and we do not make you ask twice." />
          </li>
          <li>
            <strong>
              <Trans message="Delete your account." />
            </strong>{' '}
            <Trans message="You can close your account from settings, and that deletes your data permanently. There is no recovery window, so ask for an export first if you want to keep anything." />
          </li>
          <li>
            <strong>
              <Trans message="Withdraw consent." />
            </strong>{' '}
            <Trans message="Where processing is based on consent rather than on the contract of using Keekii, you can withdraw it without losing your account." />
          </li>
          <li>
            <strong>
              <Trans message="Object to processing." />
            </strong>{' '}
            <Trans message="You can object to processing based on legitimate interests, and to direct marketing, at any time." />
          </li>
          <li>
            <strong>
              <Trans message="Manage cookies." />
            </strong>{' '}
            <Trans message="Control non-essential cookies in your browser or through our cookie settings. See the Cookies document for what each one does." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="safety" title="Safety on Keekii">
        <LegalSubSection title="Reporting harmful content">
          <p>
            <Trans message="If you encounter content on Keekii that you believe is unlawful, that promotes abuse, or that exploits a person, report it and we will review it. Reports are triaged by a person, not filtered by an automated score alone." />
          </p>
          <p>
            <Trans message="Copyright and rights complaints are handled as formal claims rather than as safety reports, because they have a legal process attached. Those go through the rights channel described on the For Artists page." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Child safety">
          <p>
            <Trans message="Keekii is not directed at children under 13, and we do not knowingly collect personal data from them. Where we become aware that an account belongs to a child, we delete it. If you believe a child has an account, contact us and we will act on it." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Fraud and impersonation">
          <p>
            <Trans message="Impersonating an artist, rights holder, listener or Keekii staff member is not permitted, and neither is asking listeners to move their payment details off-platform. Report it and we will act on the account, not just the content." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Security incidents">
          <p>
            <Trans message="If we discover a breach of personal data that is likely to affect you, we will notify the relevant supervisory authority within the statutory period and notify you where the risk is high. We would rather tell you late than not at all." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="contact" title="Contacting us">
        <p>
          <Trans message="Privacy questions, data requests and safety reports all reach a monitored address. Use the contact form and put the right subject in the title so it does not get routed to a general queue." />
        </p>
        <ul>
          <li>
            <strong>
              <Trans message="Privacy and data rights:" />
            </strong>{' '}
            privacy@music.keekii.net
          </li>
          <li>
            <strong>
              <Trans message="Safety reports:" />
            </strong>{' '}
            safety@music.keekii.net
          </li>
          <li>
            <strong>
              <Trans message="Copyright and rights claims:" />
            </strong>{' '}
            <Trans message="through the artist rights channel, so the claim is properly recorded." />
          </li>
        </ul>
        <p>
          <Trans message="If you are in the EEA or the UK and are unhappy with our response, you can complain to your local supervisory authority. We would rather you told us first, because we can usually fix it faster than a regulator can." />
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
