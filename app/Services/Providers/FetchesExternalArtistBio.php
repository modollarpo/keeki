<?php namespace App\Services\Providers;

use App\Models\Artist;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Str;
use GuzzleHttp\Promise\Promise;
use Illuminate\Support\Facades\Log;

trait FetchesExternalArtistBio
{
    public function fetchArtistBio(Artist $artist, Pool $pool): Promise|null
    {
        $provider = settings('artist_bio_provider', 'wikipedia');

        if ($provider === 'wikipedia') {
            return $this->fetchFromWikipedia($artist, $pool);
        }

        return null;
    }

    private function fetchFromWikipedia(Artist $artist, Pool $pool): Promise
    {
        return $pool
            ->as('bio')
            ->withUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            )
            ->get(
                $this->makeWikipediaApiUrl(
                    $artist->name,
                    settings('wikipedia_language', 'en'),
                ),
            );
    }

    public function getBioResponseData(?Response $response): string|null
    {
        if (!$response?->successful()) {
            if ($response?->body()) {
                if (
                    str_contains(
                        $response->body(),
                        'You are making too many requests',
                    )
                ) {
                    Log::channel('remoteApiErrors')->error(
                        'Wikipedia API rate limit exceeded',
                    );
                } else {
                    Log::error('Wikipedia API error: ' . $response?->body());
                }
            }
            return null;
        }

        if (!isset($response['query']['pages'])) {
            return null;
        }

        $response = $response['query']['pages'];
        if (!is_array($response) || empty($response)) {
            return null;
        }

        foreach ($response as $page) {
            if (
                Str::contains($page['title'], 'singer') &&
                isset($page['extract']) &&
                $page['extract']
            ) {
                return $page['extract'];
            }
            if (
                Str::contains($page['title'], 'band') &&
                isset($page['extract']) &&
                $page['extract']
            ) {
                return $page['extract'];
            }
            if (
                Str::contains($page['title'], 'rapper') &&
                isset($page['extract']) &&
                $page['extract']
            ) {
                return $page['extract'];
            }
        }

        $length = 0;
        $longest = '';

        foreach ($response as $page) {
            if (isset($page['extract']) && $page['extract']) {
                if (strlen($page['extract']) > $length) {
                    $length = strlen($page['extract']);
                    $longest = $page['extract'];
                }
            }
        }

        return $longest;
    }

    public function makeWikipediaApiUrl(
        string $name,
        string $lang = 'en',
    ): string {
        $name = trim($name);

        if ($name === '') {
            return "https://$lang.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&redirects=1";
        }

        $normalized = str_replace(' ', '_', ucwords(strtolower($name)));

        // The raw name first, so an exactly-matching article wins before any
        // disambiguation guess is tried. "(singer)", "(musician)" and friends
        // catch the common "Artist (band)" / "Artist (rapper)" article titles.
        $titles = array_unique([
            str_replace(' ', '_', $name),
            $normalized,
            $normalized.'_(singer)',
            $normalized.'_(rapper)',
            $normalized.'_(band)',
            $normalized.'_(musician)',
            $normalized.'_(singer-songwriter)',
            $normalized.'_(recording_artist)',
        ]);

        // each title is encoded individually so that "&", "#", "?" and other
        // characters in an artist name cannot break the query string
        $encoded = implode('|', array_map('rawurlencode', $titles));

        // exlimit must cover every title, otherwise extracts are truncated
        return "https://$lang.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=$encoded&redirects=1&exlimit=10";
    }
}
