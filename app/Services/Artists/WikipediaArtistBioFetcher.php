<?php

namespace App\Services\Artists;

use App\Models\Artist;
use App\Services\Providers\FetchesExternalArtistBio;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * Fetches Wikipedia lead extracts for many artists.
 *
 * The provider classes already fetch a single bio per artist via
 * FetchesExternalArtistBio, but they need an Artist instance to exist first and
 * they fetch one at a time. Mapping the catalogue by country needs the opposite
 * order: take the artists that already exist, fetch their leads, then read a
 * country out of them.
 *
 * Two deliberate differences from the provider path:
 *
 *  1. Requests are sequential and paced. Sending a pool of concurrent requests
 *     gets the whole run throttled - Wikipedia answers "You are making too many
 *     requests" and every artist in the pool comes back empty, which looks
 *     exactly like "these artists have no article".
 *
 *  2. The User-Agent identifies the app and links to it. Wikipedia's policy asks
 *     for a descriptive agent rather than a spoofed browser string, and the
 *     generic browser UA it receives is a common cause of aggressive throttling.
 *
 * Every result carries a `reason`, so a throttled run is never mistaken for a
 * catalogue of artists who genuinely have no biography.
 */
class WikipediaArtistBioFetcher
{
    use FetchesExternalArtistBio;

    private const USER_AGENT = 'KeekiiMusic/1.0 (https://music.keekii.net; artist biography fetcher)';

    /**
     * @param  iterable<Artist>  $artists
     * @param  float  $delay  seconds between requests
     * @param  int  $maxThrottles  consecutive throttles before giving up
     * @return array<int, array{bio: ?string, reason: string}>
     */
    public function fetchMany(
        iterable $artists,
        float $delay = 0.6,
        int $maxThrottles = 5,
    ): array {
        $results = [];
        $throttles = 0;

        foreach ($artists as $artist) {
            $url = $this->makeWikipediaApiUrl($artist->name, $this->language());

            try {
                $response = Http::timeout(10)
                    ->withUserAgent(self::USER_AGENT)
                    ->get($url);
            } catch (\Throwable $e) {
                $results[$artist->id] = ['bio' => null, 'reason' => 'connection-error'];
                continue;
            }

            $reason = $this->reason($response);

            if ($reason === 'rate-limited') {
                $throttles++;

                // sustained throttling means this run is counterproductive:
                // back off and let the caller resume later rather than
                // recording every remaining artist as having no biography
                if ($throttles >= $maxThrottles) {
                    $results[$artist->id] = ['bio' => null, 'reason' => 'rate-limited'];

                    break;
                }

                sleep(5);
            } else {
                $throttles = 0;
            }

            $results[$artist->id] = [
                'bio' => $this->getBioResponseData($response),
                'reason' => $reason,
            ];

            if ($delay > 0) {
                usleep((int) ($delay * 1_000_000));
            }
        }

        return $results;
    }

    private function reason(?Response $response): string
    {
        if (!$response) {
            return 'no-response';
        }

        if ($response->successful()) {
            foreach ($response->json('query.pages') ?? [] as $page) {
                if (!empty($page['extract'])) {
                    return 'ok';
                }
            }

            return 'no-article';
        }

        $status = $response->status();
        $body = $response->body();

        if (
            $status === 429
            || stripos($body, 'too many requests') !== false
            || stripos($body, 'ratelimit') !== false
        ) {
            return 'rate-limited';
        }

        if ($status === 403) {
            return 'forbidden';
        }

        return 'http-'.$status;
    }

    private function language(): string
    {
        return function_exists('settings')
            ? (string) settings('wikipedia_language', 'en')
            : 'en';
    }
}