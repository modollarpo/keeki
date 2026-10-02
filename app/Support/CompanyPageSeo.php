<?php

namespace App\Support;

use App\Models\CompanyPageSeoOverride;
use Illuminate\Database\QueryException;

/**
 * Server-side SEO copy for Keekii's public marketing, plan and legal pages.
 *
 * These pages are rendered client side by React, which means crawlers that do
 * not execute JavaScript would otherwise see an empty shell. The controller
 * renders `seo/company-page/seo-tags` and `seo/company-page/prerender` from the
 * data below so every public page has real title, description, canonical link
 * and crawlable body copy.
 *
 * This map is keyed by route path and is the PHP half of the pair:
 *
 *   resources/client/company/company-site-map.ts        (labels + nav + routes)
 *   app/Support/CompanyPageSeo.php                      (this file, SEO copy)
 *
 * Paths must stay in sync with both, with `resources/client/company/company-routes.tsx`
 * and with the route loop in `routes/web.php`. `Tests\Feature\CompanyPageSeoTest`
 * guards the PHP side of that contract.
 */
class CompanyPageSeo
{
    /**
     * @return array<string, array{
     *     group: string,
     *     label: string,
     *     title: string,
     *     description: string,
     * }>
     */
    public static function all(): array
    {
        return [
            // Company
            '/about' => [
                'group' => 'Company',
                'label' => 'About',
                'title' => 'About Keekii',
                'description' => 'Keekii is an independent music platform built by Storegrill Inc Ltd. Meet the team, the mission and the company behind the catalogue.',
            ],
            '/jobs' => [
                'group' => 'Company',
                'label' => 'Jobs',
                'title' => 'Jobs at Keekii',
                'description' => 'Open roles in engineering, design, product and artist support at Keekii, plus how we hire and what we offer.',
            ],
            '/for-the-record' => [
                'group' => 'Company',
                'label' => 'For the Record',
                'title' => 'For the Record',
                'description' => 'What Keekii stands for: artist-owned music, transparent streaming numbers and long-term commitment to the people who make it.',
            ],
            '/communities' => [
                'group' => 'Company',
                'label' => 'Communities',
                'title' => 'Keekii Communities',
                'description' => 'The collectives, crews and local scenes shaping the Keekii catalogue, and how to get your community on the platform.',
            ],
            '/artists' => [
                'group' => 'Company',
                'label' => 'For Artists',
                'title' => 'For Artists on Keekii',
                'description' => 'Upload your music to Keekii, keep your rights, and see exactly how every stream and payout is calculated.',
            ],
            '/creators' => [
                'group' => 'Company',
                'label' => 'For Creators',
                'title' => 'Music for Creators',
                'description' => 'Cleared music for video, podcast, streams and social. Use the Keekii catalogue in commercial content without copyright claims.',
            ],
            '/authors' => [
                'group' => 'Company',
                'label' => 'For Authors',
                'title' => 'For Authors and Songwriters',
                'description' => 'Register your lyrics and writing credits on Keekii to collect the writing royalties your work earns.',
            ],
            '/developers' => [
                'group' => 'Company',
                'label' => 'Developers',
                'title' => 'Keekii Developers',
                'description' => 'REST API documentation, webhooks, authentication and SDKs for building on the Keekii music platform.',
            ],
            '/advertising' => [
                'group' => 'Company',
                'label' => 'Advertising',
                'title' => 'Advertise on Keekii',
                'description' => 'Reach listeners with audio, display and video campaigns on Keekii. Formats, inventory and how to get a media plan.',
            ],
            '/investors' => [
                'group' => 'Company',
                'label' => 'Investors',
                'title' => 'Keekii Investors',
                'description' => 'Company information, governance and reporting for Keekii shareholders and prospective investors.',
            ],
            '/vendors' => [
                'group' => 'Company',
                'label' => 'Vendors',
                'title' => 'Keekii Vendors',
                'description' => 'Labels, distributors, agencies and suppliers: how to work with Keekii and how to get paid.',
            ],

            // Useful links
            '/support' => [
                'group' => 'Useful links',
                'label' => 'Support',
                'title' => 'Keekii Support',
                'description' => 'Get help with your Keekii account, playback, billing and uploads. Troubleshooting guides and a direct route to our support team.',
            ],
            '/free-mobile-app' => [
                'group' => 'Useful links',
                'label' => 'Free Mobile App',
                'title' => 'Free Keekii Mobile App',
                'description' => 'Download the Keekii app for iOS and Android free of charge and take your music with you.',
            ],
            '/popular-by-country' => [
                'group' => 'Useful links',
                'label' => 'Popular by Country',
                'title' => 'Popular Music by Country',
                'description' => 'Top artists and tracks in every market where Keekii is available, updated as the charts move.',
            ],
            '/top-song-lyrics' => [
                'group' => 'Useful links',
                'label' => 'Top Song Lyrics',
                'title' => 'Top Song Lyrics',
                'description' => 'The most searched lyrics on Keekii, by song and by artist, with synced timestamps where available.',
            ],
            '/import-your-music' => [
                'group' => 'Useful links',
                'label' => 'Import your music',
                'title' => 'Import Your Music to Keekii',
                'description' => 'Bring your catalogue to Keekii from another streaming service or from your own files, with a guide for every step.',
            ],
            '/plans' => [
                'group' => 'Useful links',
                'label' => 'Keekii Plans',
                'title' => 'Keekii Plans and Pricing',
                'description' => 'Compare Keekii Free with Premium Individual, Duo, Family and Student, and see exactly what each plan includes.',
            ],
            '/plans/premium-individual' => [
                'group' => 'Useful links',
                'label' => 'Premium Individual',
                'title' => 'Keekii Premium Individual',
                'description' => 'One account with ad-free listening, offline downloads and full audio quality.',
            ],
            '/plans/premium-duo' => [
                'group' => 'Useful links',
                'label' => 'Premium Duo',
                'title' => 'Keekii Premium Duo',
                'description' => 'Two separate Keekii accounts on a single bill, each with full Premium benefits.',
            ],
            '/plans/premium-family' => [
                'group' => 'Useful links',
                'label' => 'Premium Family',
                'title' => 'Keekii Premium Family',
                'description' => 'Up to six separate Premium accounts on one subscription, including one that works while you travel.',
            ],
            '/plans/premium-student' => [
                'group' => 'Useful links',
                'label' => 'Premium Student',
                'title' => 'Keekii Premium Student',
                'description' => 'Full Premium benefits for verified students at a reduced rate.',
            ],
            '/plans/keekii-free' => [
                'group' => 'Useful links',
                'label' => 'Keekii Free',
                'title' => 'Keekii Free',
                'description' => 'Listen on Keekii without a subscription, and see what Premium adds.',
            ],

            // Legal
            '/legal' => [
                'group' => 'Legal',
                'label' => 'Safety & Privacy Center',
                'title' => 'Safety & Privacy Center',
                'description' => 'How Keekii handles safety, privacy and your rights, in one place: reporting, data requests, advertising and accessibility.',
            ],
            '/privacy-policy' => [
                'group' => 'Legal',
                'label' => 'Privacy Policy',
                'title' => 'Privacy Policy',
                'description' => 'What personal data Keekii collects, why we collect it, how long we keep it and who we share it with.',
            ],
            '/cookies' => [
                'group' => 'Legal',
                'label' => 'Cookies',
                'title' => 'Cookie Policy',
                'description' => 'The cookies Keekii sets, what each one does, and how to control or delete them in your browser.',
            ],
            '/about-ads' => [
                'group' => 'Legal',
                'label' => 'About Ads',
                'title' => 'About Ads on Keekii',
                'description' => 'Why Keekii Free shows advertising, what we measure, why Premium is ad-free, and how to opt out.',
            ],
            '/accessibility' => [
                'group' => 'Legal',
                'label' => 'Accessibility',
                'title' => 'Accessibility at Keekii',
                'description' => 'The accessibility standard Keekii targets across web, app and player, and how to report a barrier.',
            ],
            '/gdpr' => [
                'group' => 'Legal',
                'label' => 'GDPR',
                'title' => 'Your GDPR Rights',
                'description' => 'Access, correct, export, restrict or erase your personal data under the GDPR, and how to exercise each right.',
            ],
            '/terms' => [
                'group' => 'Legal',
                'label' => 'Terms of Use',
                'title' => 'Terms of Use',
                'description' => 'The agreement between you and Keekii: what the service provides, acceptable use, liability, and how either side can end it.',
            ],
        ];
    }

    /**
     * Look up a page by route path or bare slug, ie `/about` or `about`.
     *
     * @return array{
     *     path: string,
     *     slug: string,
     *     group: string,
     *     label: string,
     *     title: string,
     *     description: string,
     * }|null
     */
    public static function get(string $slug): ?array
    {
        $pages = static::all();
        $key = '/' . trim($slug, '/');

        if (!isset($pages[$key])) {
            return null;
        }

        return [
            'path' => $key,
            'slug' => trim($key, '/'),
            ...$pages[$key],
            ...static::overrides()[$key] ?? [],
        ];
    }

    /**
     * Admin overrides, keyed by path, as a sparse array of only the fields that
     * were actually changed.
     *
     * This is the only place that reads the overrides table, and it is reached
     * from a public page render, so a missing table must never take a page
     * down: the code defaults are always a correct answer.
     *
     * @return array<string, array{title?: string, description?: string}>
     */
    public static function overrides(): array
    {
        try {
            $rows = CompanyPageSeoOverride::query()->get();
        } catch (QueryException) {
            // The table arrives with a migration that can run after this code is
            // already serving. Until it does, every page falls back to the
            // defaults baked in below.
            return [];
        }

        $overrides = [];

        foreach ($rows as $row) {
            $fields = array_filter(
                [
                    'title' => $row->title,
                    'description' => $row->description,
                ],
                // Whitespace only counts as "cleared" too: an empty <title> is
                // worse for SEO than falling back to the default.
                fn ($value) => $value !== null && trim((string) $value) !== '',
            );

            if ($fields !== []) {
                $overrides[$row->path] = $fields;
            }
        }

        return $overrides;
    }

    /**
     * Every routable path, ie `/about`, `/plans/premium-duo`.
     *
     * @return array<int, string>
     */
    public static function slugs(): array
    {
        return array_keys(static::all());
    }

    /**
     * Flattened nav entries for the crawler prerender, optionally limited to
     * one group. Keeps internal linking between the public pages intact without
     * shipping the whole map to the client on every page view.
     *
     * @return array<int, array{label: string, url: string}>
     */
    public static function links(?string $group = null): array
    {
        $links = [];

        foreach (static::all() as $path => $page) {
            if ($group !== null && $page['group'] !== $group) {
                continue;
            }

            $links[] = [
                'label' => $page['label'],
                'url' => url(ltrim($path, '/')),
            ];
        }

        return $links;
    }
}
