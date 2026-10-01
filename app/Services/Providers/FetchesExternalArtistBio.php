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

        // A disambiguation page is not a biography. "IU" resolves to a page
        // whose lead is "IU may refer to:", which is a list of meanings and no
        // nationality at all. Left in, it both hides the real article and gets
        // stored as if it were the artist's description.
        $response = array_filter(
            $response,
            fn ($page) => ! str_contains(
                mb_strtolower((string) ($page['extract'] ?? '')),
                'may refer to',
            ),
        );

        if ($response === []) {
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

        // strtolower/ucwords only fold ASCII, so a name that arrives in caps
        // with an accent - "ROSALIA" from Deezer - never becomes the real title
        // "Rosalia". Uppercase only the first character, which fixes those
        // without mangling names like "A.R. Rahman" where the rest of the
        // capitalisation is deliberate.
        $firstLetterUpper = mb_strtoupper(mb_substr($name, 0, 1)).mb_substr($name, 1);

        // Providers sometimes return a name in all caps ("ROSALIA"). Wikipedia
        // titles are case-sensitive and always proper-cased, so fold those with
        // a UTF-8 aware title case - but only when the entire name is uppercase,
        // because applying it unconditionally would turn "A.R. Rahman" into
        // "A.r. Rahman" and lose a real article.
        $folded = $name === mb_strtoupper($name, 'UTF-8')
            ? mb_convert_case(mb_strtolower($name, 'UTF-8'), MB_CASE_TITLE, 'UTF-8')
            : $firstLetterUpper;

        // The raw name first, so an exactly-matching article wins before any
        // disambiguation guess is tried. "(singer)", "(musician)" and friends
        // catch the common "Artist (band)" / "Artist (rapper)" article titles.
        $titles = array_unique([
            str_replace(' ', '_', $name),
            str_replace(' ', '_', $firstLetterUpper),
            str_replace(' ', '_', $folded),
            $normalized,
        ]);

        // Every capitalisation form gets the suffixed variants. Building them from
        // the lowercased form alone silently misses articles whose title keeps
        // its capitals: IU's biography is at "IU (entertainer)", not
        // "Iu (entertainer)", so only the disambiguation page came back.
        // Five suffixes keeps the total at or under exlimit; a longer list would
        // leave some requested titles without extracts.
        foreach (array_unique([$name, $firstLetterUpper, $folded, $normalized]) as $prefix) {
            foreach ([
                '_(singer)',
                '_(band)',
                '_(musician)',
                '_(entertainer)',
                '_(rapper)',
            ] as $suffix) {
                $titles[] = str_replace(' ', '_', $prefix).$suffix;
            }
        }

        $titles = array_values(array_unique($titles));

        // each title is encoded individually so that "&", "#", "?" and other
        // characters in an artist name cannot break the query string
        $encoded = implode('|', array_map('rawurlencode', $titles));

        // exlimit must cover every title, otherwise extracts are truncated
        return "https://$lang.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=$encoded&redirects=1&exlimit=20";
    }
}
