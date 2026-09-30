import {
  BracesIcon,
  BookOpenIcon,
  KeyRoundIcon,
  RadioTowerIcon,
  ScrollTextIcon,
  WebhookIcon,
} from 'lucide-react';
import {Trans} from '@ui/i18n/trans';
import {CompanyPageLayout} from '../company-page-layout';
import {
  CompanyCallout,
  CompanyCtaBand,
  CompanyFaq,
  CompanyFeatureGrid,
  CompanyProse,
  CompanySectionBlock,
} from '../company-page-sections';

const endpoints = [
  {method: 'GET', path: '/api/v1/search?q=', description: 'Search artists, albums, tracks and playlists'},
  {method: 'GET', path: '/api/v1/tracks/{id}/wave', description: 'Waveform peaks for a track'},
  {method: 'GET', path: '/api/v1/stream/{track}.mp3', description: 'Direct stream for a track'},
  {method: 'GET', path: '/api/v1/img-proxy?url=', description: 'Proxied artwork with resizing'},
  {method: 'POST', path: '/api/v1/lyrics', description: 'Add or replace lyrics on a track'},
  {method: 'GET', path: '/api/v1/channels/{slug}', description: 'Resolve a channel and its sections'},
  {method: 'GET', path: '/api/v1/radio/{type}/{id}', description: 'Build a radio stream from a seed'},
  {method: 'GET', path: '/api/v1/import-media/single-item', description: 'Metadata lookup for an import'},
];

const methodColors: Record<string, string> = {
  GET: 'text-primary',
  POST: 'text-positive',
};

export function Component() {
  return (
    <CompanyPageLayout
      path="/developers"
      title="Build on Keekii"
      lead="A documented REST API, an OpenAPI specification, and webhooks for the things you need to know about without polling. Everything below runs against the same catalogue the web player uses."
      actions={[
        {label: 'Read the API reference', to: '/api-docs'},
        {label: 'Request API access', to: '/contact'},
      ]}
    >
      <CompanySectionBlock
        title="What is available"
        description="The API is not a separate, reduced copy of Keekii. It is the same catalogue the player reads."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: BracesIcon,
              title: 'REST, JSON, versioned',
              description:
                'A versioned JSON API under /api/v1. Resources are conventional and responses are paginated consistently.',
            },
            {
              icon: BookOpenIcon,
              title: 'Interactive reference',
              description:
                'The full OpenAPI specification is published, with request parameters, response shapes and examples.',
            },
            {
              icon: WebhookIcon,
              title: 'Webhooks',
              description:
                'Subscribe to catalogue events instead of polling. Retry with backoff, verify the signature, deduplicate by event id.',
            },
            {
              icon: KeyRoundIcon,
              title: 'Token authentication',
              description:
                'Scoped tokens for user-authorised endpoints, so an integration only gets what it asked for.',
            },
            {
              icon: ScrollTextIcon,
              title: 'Consistent envelopes',
              description:
                'Success and error responses share a shape, so error handling does not have to be written twice per endpoint.',
            },
            {
              icon: RadioTowerIcon,
              title: 'Streaming and waveforms',
              description:
                'Direct stream URLs and precomputed waveform peaks, which is what you need for a player.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Endpoints people use first"
        description="A representative slice. The reference has the rest."
        background="muted"
      >
        <div className="overflow-x-auto rounded-card border border-border bg-card">
          <table className="w-full min-w-[42rem] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-5 py-3.5 font-semibold">Method</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Path</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Returns</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map(endpoint => (
                <tr
                  key={`${endpoint.method} ${endpoint.path}`}
                  className="border-b border-border/60 last:border-0"
                >
                  <td
                    className={`px-5 py-3.5 font-mono text-xs font-semibold ${methodColors[endpoint.method] ?? ''}`}
                  >
                    {endpoint.method}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-foreground">
                    {endpoint.path}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <Trans message={endpoint.description} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Trans message="This is an excerpt. The complete specification is published at /api-docs." />
        </p>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Using the API properly"
        align="left"
        narrow
      >
        <CompanyProse>
          <h2>
<Trans message="Get an endpoint that plays audio" />
</h2>
          <p>

            <Trans message="Resolving a track returns the metadata you want. Playing it is a separate call: ask the stream endpoint for a URL, and the waveform endpoint for the peaks you need to draw a seekbar that matches." />

            </p>

          <h2>
<Trans message="Do not poll for what a webhook tells you" />
</h2>
          <p>

            <Trans message="Webhook delivery is at-least-once, so your handler must be idempotent. Verify the signature, respond quickly with a 2xx, and process the body afterwards rather than holding the connection open." />

            </p>

          <h2>
<Trans message="Cache what does not change" />
</h2>
          <p>

            <Trans message="Artwork and stream URLs should be cached rather than re-fetched per request. The image proxy exists so you are not making your own users hotlink the origin." />

            </p>

          <h2>
<Trans message="Respect the rate limits" />
</h2>
          <p>

            <Trans message="Rate limit headers are returned on every response. Back off on a 429 rather than retrying immediately, and if you genuinely need more, ask -- it is usually easier to raise a limit than to leave you guessing." />

            </p>

          <h2>
<Trans message="Do not use the API to build another streaming service" />
</h2>
          <p>

            <Trans message="The API exists for integrations, tools, research and internal business use. Redistribution of the catalogue through it is not something we grant." />

            </p>
        </CompanyProse>
      </CompanySectionBlock>

      <CompanySectionBlock align="left" narrow background="elevated">
        <CompanyCallout title="Getting access" tone="primary">
          <p>
            Public read endpoints work without a token. Anything user-scoped --
            playlists, library, profile data -- needs a token issued against a
            Keekii account, and anything that writes needs a scope that says so.
          </p>
          <p>
            Webhook subscriptions are configured per integration. Send a note to
            developer support with what you are building and which events you
            need, and it will be set up with you.
          </p>
        </CompanyCallout>
      </CompanySectionBlock>

      <CompanySectionBlock
        title="Frequently asked questions"
        description="The questions that come up in the first week."
        background="muted"
      >
        <CompanyFaq
          questions={[
            {
              question: 'Do I need a key to read public data?',
              answer:
                'No. Catalogue, search and channel endpoints are readable without a token, subject to the rate limit.',
            },
            {
              question: 'Is there a sandbox?',
              answer:
                'Yes. Ask for sandbox credentials and you get a separate environment with test data so you are not writing against production.',
            },
            {
              question: 'How do I get webhooks?',
              answer:
                'Tell developer support which events you need and they will configure the subscription for your integration.',
            },
            {
              question: 'Are there breaking changes?',
              answer:
                'The API is versioned. A breaking change gets a new version, and the old one is deprecated with a stated window rather than removed.',
            },
            {
              question: 'Can I use the API commercially?',
              answer:
                'Yes, for integration and application use. Redistributing the catalogue through the API is not covered -- see the terms for that.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanyCtaBand
        title="Start building"
        description="The reference is public and does not need a login to read. Ask for a token when you need one that does something."
        actions={[
          {label: 'Read the API reference', to: '/api-docs'},
          {label: 'Request API access', to: '/contact'},
        ]}
      />

      <p className="pb-10 text-center text-sm text-muted-foreground">
        <Trans message="Base URL: /api/v1 &middot; Auth: bearer token &middot; Format: JSON" />
      </p>
    </CompanyPageLayout>
  );
}