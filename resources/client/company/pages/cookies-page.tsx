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
      path="/cookies"
      title="Cookies on Keekii"
      lead="Every cookie Keekii sets, what each one actually does, whether it is necessary, and how to control the ones that are not."
      updated="1 October 2026"
    >
      <LegalNote>
        <Trans message="A cookie is a small file a website asks your browser to store. Some are needed for the site to work at all. The rest are a choice, and you get to make it." />
      </LegalNote>

      <LegalSection id="what-cookies-are" title="What cookies are, briefly">
        <p>
          <Trans message="When you load a Keekii page, the server can ask your browser to store a small text file, and your browser sends it back with later requests. That is the whole mechanism. The same effect can also be achieved with local storage, and on Keekii we use both for the same purposes in different places." />
        </p>
        <p>
          <Trans message="Some cookies are set by Keekii. Some are set by advertising and analytics partners on Keekii Free, and those only appear if you are on the free tier. Premium sessions set no advertising cookies at all." />
        </p>
      </LegalSection>

      <LegalSection id="essential" title="Essential cookies">
        <p>
          <Trans message="These keep you signed in and keep the service secure. They cannot be switched off, because without them there is no account, no player and no checkout. They are set on every plan." />
        </p>
        <ul>
          <li>
            <strong>Session cookie</strong> &mdash;{' '}
            <Trans message="keeps you signed in across pages and detects cross-site request forgery. Expires when you sign out or close the browser." />
          </li>
          <li>
            <strong>CSRF token</strong> &mdash;{' '}
            <Trans message="proves that a form submission came from a page Keekii served, so another site cannot submit forms as you." />
          </li>
          <li>
            <strong>Load balancer routing</strong> &mdash;{' '}
            <Trans message="keeps you on the same server for the length of a request so large responses are not interrupted." />
          </li>
          <li>
            <strong>Rate limiting</strong> &mdash;{' '}
            <Trans message="counts requests so that one client cannot take the service down for everyone else." />
          </li>
          <li>
            <strong>Locale and consent state</strong> &mdash;{' '}
            <Trans message="remembers your language choice and the cookie choices you already made, so we stop asking." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="functional" title="Functional cookies">
        <p>
          <Trans message="These remember choices you made about how Keekii behaves for you. They are not required for the site to load, but turning them off means a slightly worse experience on every visit." />
        </p>
        <ul>
          <li>
            <strong>Audio and quality preferences</strong> &mdash;{' '}
            <Trans message="remembers your chosen bitrate, the last volume you set, and whether you prefer explicit or clean versions." />
          </li>
          <li>
            <strong>Player position</strong> &mdash;{' '}
            <Trans message="remembers where you were in a track or playlist so playback can resume where you left it." />
          </li>
          <li>
            <strong>Interface state</strong> &mdash;{' '}
            <Trans message="remembers collapsed sections, your selected country or genre channel, and your sort order." />
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="analytics" title="Analytics">
        <p>
          <Trans message="Keekii uses first-party analytics to find out which features work, where the service is slow and what breaks. We measure in aggregate, we do not build advertising profiles, and we do not use cross-site tracking to follow you around the web." />
        </p>
        <p>
          <Trans message="We do not use analytics cookies to build an advertising profile, and blocking them in your browser does not stop you using any part of Keekii. Declining them does mean we have less evidence about whether a page is working, which is a real cost to us and no cost to you." />
        </p>
      </LegalSection>

      <LegalSection id="advertising" title="Advertising cookies">
        <p>
          <Trans message="On Keekii Free, advertising partners may set cookies to limit how often you see the same campaign, to measure whether an ad was served and viewed, and to understand campaign performance. They do not receive your account email, your payment details, or a list of what you have listened to." />
        </p>
        <p>
          <Trans message="If you subscribe to any Premium plan, Keekii stops serving advertising entirely, and no advertising cookies are set for your session. This is the same behaviour described on the About Ads page." />
        </p>
        <p>
          <Link to="/about-ads" className="underline underline-offset-4">
            <Trans message="Read how advertising works on Keekii" />
          </Link>
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="Embedded content and third parties">
        <p>
          <Trans message="Parts of Keekii embed or load content from other services -- advertising creative, payment pages, sharing, and the API documentation viewer. When that happens, the other service may set its own cookies under its own policy, and we do not control that." />
        </p>
        <p>
          <Trans message="We do not embed advertising in a way that gives an advertiser the ability to read the page you are on alongside your identity unless you have explicitly interacted with that advertiser, and we do not permit third-party code to run in the authentication flow." />
        </p>
      </LegalSection>

      <LegalSection id="managing" title="Controlling cookies">
        <LegalSubSection title="In your browser">
          <p>
            <Trans message="Every major browser can block or delete cookies, either entirely or selectively. Blocking essential cookies will stop you being able to sign in, which is unavoidable. Every browser also offers a per-site control." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="In Keekii">
          <p>
            <Trans message="The cookie notice shown to visitors in the UK and the European Economic Area stores your acknowledgement for 30 days, after which we ask again. You can clear that cookie at any time in your browser, and doing so simply brings the notice back on your next visit." />
          </p>
        </LegalSubSection>
        <LegalSubSection title="Do Not Track and Global Privacy Control">
          <p>
            <Trans message="Where your browser sends a Do Not Track or Global Privacy Control signal, we honour it for advertising and optional analytics." />
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="contact" title="Questions">
        <p>
          <Trans message="Write to" />{' '}
          <a href="mailto:privacy@music.keekii.net">privacy@music.keekii.net</a>{' '}
          <Trans message="with the subject Cookies. If you think a specific cookie should not be there at all, say which page you saw it on and we will look at it." />
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}