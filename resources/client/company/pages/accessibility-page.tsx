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
      path="/accessibility"
      title="Accessibility at Keekii"
      lead="What standard we build to, what we know is not working yet, and how to tell us when something blocks you. Reporting a barrier is not a courtesy to us; it is the only way we find out."
      updated="1 October 2026"
    >
      <LegalNote>
        <Trans message="Keekii is a music service. Being unable to use it is not an inconvenience, it is being locked out of something. We treat accessibility reports as defects." />
      </LegalNote>

      <LegalSection id="standard" title="The standard we target">
        <p>
          <Trans message="We target WCAG 2.2 Level AA across the web player, the account and billing surfaces, the mobile apps, and every public page including these documents." />
        </p>
        <p>
          <Trans message="We target it rather than claim to meet it in every screen, because a standard nobody can verify is a press release. Where we fall short, we say which part and roughly when we expect to fix it." />
        </p>
      </LegalSection>

      <LegalSection id="what-we-build-to" title="What that means in practice">
        <LegalSubSection title="Keyboard">
          <p>
            <Trans message="Every interactive control is reachable and operable from the keyboard, with a visible focus indicator that does not disappear against the background. The player, including play, pause, skip, seek, volume and queue, is fully keyboard operable." />
          </p>
          <p>
            <Trans message="We do not trap keyboard focus in dialogs except where the dialog genuinely requires it, and Escape closes them." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Screen readers">
          <p>
            <Trans message="Pages use landmark regions and a single logical heading order. Controls carry accessible names, state is exposed with the right roles and properties, and dynamic changes such as now-playing updates are announced rather than silently swapped in." />
          </p>
          <p>
            <Trans message="Artwork carries alt text, or is marked decorative when the adjacent text already names the release. Error messages are associated with the field that caused them, not just coloured red." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Visual presentation">
          <p>
            <Trans message="Text meets minimum contrast ratios, including in the dark and light themes, and text can be resized to 200% without loss of content or function. Nothing is conveyed by colour alone. Motion respects a reduced-motion preference." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Audio and captions">
          <p>
            <Trans message="Lyrics are provided as text, not as images, so they can be read by assistive technology and scaled. Any video on Keekii with speech carries captions." />
          </p>
          <p>
            <Trans message="There is no audio content that is the only way to obtain information on Keekii, with the single exception of the music itself -- which is the product." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Input and timing">
          <p>
            <Trans message="No functionality depends on a pointer or on a gesture. Timeouts can be extended, turned off or restarted, and nothing important disappears before a user with assistive technology can reach it." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="known-gaps" title="What we know is not there yet">
        <p>
          <Trans message="We would rather list the known gaps than let you find them. The current ones are:" />
        </p>
        <ul>
          <li>
            <Trans message="The waveform seekbar is not yet fully operable by keyboard. Arrow-key seeking is not implemented in the current player build, and mouse or touch is required to scrub accurately. This is the most significant gap on the service and it is being worked on." />
          </li>
          <li>
            <Trans message="Third-party embedded content, including some advertising creative and the API documentation viewer, is outside our control and does not meet this standard. Where we can, we make it clearly separable and keyboard reachable." />
          </li>
          <li>
            <Trans message="Some chart and chart-adjacent visualisations in the admin reporting surfaces do not have text equivalents. These are not public listener pages, and they are on the same list." />
          </li>
          <li>
            <Trans message="The mobile apps have not been independently audited to WCAG 2.2 AA. We are working to the standard internally, and we do not claim an audit we have not had." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="how-to-test" title="Testing with us">
        <p>
          <Trans message="If you are testing with assistive technology, or evaluating Keekii for an accessibility policy, tell us which combination you are using and what broke. That specific detail is the difference between a report we can act on and a report we can only apologise for." />
        </p>
        <p>
          <Trans message="Include the page, the browser or app version, the assistive technology and its version, and what you expected to happen. A short screen recording is worth more than a long description." />
        </p>
      </LegalSection>

      <LegalSection id="reporting" title="Reporting a barrier">
        <p>
          <Trans message="Send reports to" />{' '}
          <a href="mailto:accessibility@music.keekii.net">
            accessibility@music.keekii.net
          </a>{' '}
          <Trans message="or through the contact form with the subject Accessibility. We acknowledge every report, we triage blocking barriers ahead of everything else, and we tell you the outcome even when the answer is that we have not fixed it yet." />
        </p>
        <ul>
          <li>
            <strong>
              <Trans message="Blocks you entirely from using Keekii:" />
            </strong>{' '}
            <Trans message="triaged immediately." />
          </li>
          <li>
            <strong>
              <Trans message="Makes something substantially harder to use:" />
            </strong>{' '}
            <Trans message="triaged ahead of enhancement work." />
          </li>
          <li>
            <strong>
              <Trans message="Anything else:" />
            </strong>{' '}
            <Trans message="logged, reviewed, and answered." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="conformance" title="Conformance and feedback">
        <p>
          <Trans message="This page is Keekii's accessibility statement. It describes the standard we build to, the gaps we are aware of, and how to reach us. It is not a claim of full conformance, and we will not claim one while the gaps listed above are open." />
        </p>
        <p>
          <Trans message="Questions about how Keekii handles your data are covered separately in our" />{' '}
          <Link to="/privacy-policy" className="underline underline-offset-4">
            <Trans message="Privacy Policy" />
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}