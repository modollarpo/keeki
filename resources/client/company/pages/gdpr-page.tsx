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
      path="/gdpr"
      title="Your GDPR rights on Keekii"
      lead="How to access, correct, export and erase your personal data under the UK GDPR and the EU General Data Protection Regulation -- in plain terms, with what to send and what happens next."
      updated="1 October 2026"
    >
      <LegalNote>
        <Trans message="Keekii is a product of Storegrill Inc Ltd, registered in England and Wales. For personal data relating to you in the UK or the EEA, we are the data controller, and the UK GDPR and the EU GDPR apply to us as they do to any controller." />
      </LegalNote>

      <LegalSection id="quick" title="The short version">
        <ul>
          <li>
            <strong>
              <Trans message="There is no charge." />
            </strong>{' '}
            <Trans message="Exercising a right is free. Anyone charging you for it is not us." />
          </li>
          <li>
            <strong>
              <Trans message="One month." />
            </strong>{' '}
            <Trans message="That is our target for a complete response. If a request is genuinely complex we will tell you early, with a reason and a date, rather than go quiet." />
          </li>
          <li>
            <strong>
              <Trans message="No identity documents by default." />
            </strong>{' '}
            <Trans message="If we need to verify who you are, we will ask you to confirm control of the account email rather than send us a passport. There are narrow cases where the law permits us to request more, and we will explain why." />
          </li>
          <li>
            <strong>
              <Trans message="Automated and fast." />
            </strong>{' '}
            <Trans message="Export and deletion can be started from your own account settings without contacting us at all." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="how-to-ask" title="How to make a request">
        <LegalSubSection title="Do it yourself first">
          <p>
            <Trans message="Export and deletion are available from account settings. If you can do it there, you will get the result faster than a request by email, and it goes straight into the right queue." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="By email">
          <p>
            <Trans message="Write to" />{' '}
            <a href="mailto:privacy@music.keekii.net">privacy@music.keekii.net</a>{' '}
            <Trans message="with the subject GDPR request. Include the email address on the Keekii account and which right you are exercising. One request can cover several rights -- say so explicitly and we will treat it as one request, not several." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="What happens next">
          <p>
            <Trans message="We confirm receipt, verify that the request comes from the account holder, run the relevant process, and send you the outcome with enough detail to check it. If we are going to refuse or limit a request, we explain why and tell you how to complain." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="rights" title="What you can require">
        <LegalSubSection title="Access -- Article 15">
          <p>
            <Trans message="Confirmation of whether we process your data, a copy of it, the purposes of processing, the categories of data, the recipients, the retention period, and your rights. You get this as readable files, not as a PDF of a database dump." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Rectification -- Article 16">
          <p>
            <Trans message="Correction of inaccurate data and completion of incomplete data. This covers account details, and -- relevant to Keekii -- artist credits, songwriter credits and lyrics you have the right to change." />
          </p>
          <p>
            <Trans message="Where a correction affects royalty reporting that has already been sent to a publisher or society, we notify them as well. A silent correction that leaves the money in the wrong place is not a correction." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Erasure -- Article 17">
          <p>
            <Trans message="Deletion where we have no overriding reason to keep the data. Closing your account deletes your account data within 30 days, and removes your personal data from backups within 35 days." />
          </p>
          <p>
            <Trans message="We do not erase data we are legally required to retain, and we do not delete the aggregated statistics that can no longer be traced to you. Where retention is required, we restrict the data rather than pretend to delete it." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Restriction -- Article 18">
          <p>
            <Trans message="Limiting how we use your data while a dispute about it is resolved. Your account can stay open and usable while the disputed data is held." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Portability -- Article 20">
          <p>
            <Trans message="Your data in a structured, commonly used, machine-readable format. For a Keekii account that means your profile, your playlists, your library, your likes, your follows and your listening history, as JSON and CSV." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Objection -- Article 21">
          <p>
            <Trans message="Objecting to processing based on legitimate interests, and to direct marketing at any time. We stop, unless we can demonstrate compelling grounds that override your objection, in which case we tell you what they are." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Withdraw consent -- Article 7(3)">
          <p>
            <Trans message="Where we rely on consent rather than on the contract of using Keekii, you can withdraw it without losing your account or your subscription. Non-essential cookies and optional analytics are the main cases." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="automated" title="Automated decision-making -- Article 22">
        <p>
          <Trans message="Recommendations, radio streams and country and genre charts on Keekii are generated by automated systems. None of them produces legal or similarly significant effects, and none of them changes what you are charged, so the right not to be subject to a solely automated decision does not bite in the ordinary way." />
        </p>
        <p>
          <Trans message="You can still remove their input: clear your listening history, start a session from something you chose, or use a search result instead of a generated one. If you believe an automated decision about your account has affected your rights, raise it and we will explain how it was reached." />
        </p>
      </LegalSection>

      <LegalSection id="complaints" title="Complaints and escalation">
        <p>
          <Trans message="If you are not satisfied with our response, tell us first. We would rather fix a problem than have a regulator do it, and most complaints we receive are cases where we were slow rather than wrong." />
        </p>
        <p>
            <Trans message="You also have the right to complain to your supervisory authority. In the UK that is the Information Commissioner's Office; in the EU it is the data protection authority where you live, work, or where you believe the infringement happened. We will give you the details for your country on request." />
          </p>
      </LegalSection>

      <LegalSection id="related" title="Related documents">
        <ul>
          <li>
            <Link to="/privacy-policy" className="underline underline-offset-4">
              <Trans message="Privacy Policy" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="what we hold, why, and for how long." />
          </li>
          <li>
            <Link to="/cookies" className="underline underline-offset-4">
              <Trans message="Cookies" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="the cookies behind consent, and how to withdraw it." />
          </li>
          <li>
            <Link to="/about-ads" className="underline underline-offset-4">
              <Trans message="About Ads" />
            </Link>{' '}
            &mdash;{' '}
            <Trans message="what advertising does and does not see." />
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