<?php

namespace App\Services\Artists;

use App\Models\Artist;
use App\Services\Providers\FetchesExternalArtistBio;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

/**
 * Fetches Wikipedia lead extracts for many artists at once.
 *
 * The provider classes already fetch a single bio per artist via
 * FetchesExternalArtistBio, but they need an Artist instance to exist first and
 * they fetch one at a time. Mapping the catalogue by country needs the opposite
 * order: take the artists that already exist, fetch their leads in bulk, then
 * read a country out of them.
 *
 * The URL scheme and the response parsing are reused from the trait so there is
 * only one definition of what a "Wikipedia lead" means in this app.
 */
class WikipediaArtistBioFetcher
{
    use FetchesExternalArtistBio;

    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';

    /**
     * @param  iterable<Artist>  $artists
     * @return array<int, string> artist id => lead text, only where one was found
     */
    public function fetchMany(iterable $artists): array
    {
        $urls = [];

        foreach ($artists as $artist) {
            $urls[$artist->id] = $this->makeWikipediaApiUrl(
                $artist->name,
                $this->language(),
            );
        }

        if ($urls === []) {
            return [];
        }

        $responses = Http::pool(fn (Pool $pool) => $this->requests($pool, $urls));

        $bios = [];

        foreach ($urls as $id => $url) {
            $bio = $this->getBioResponseData($responses['bio-'.$id] ?? null);

            if ($bio) {
                $bios[$id] = $bio;
            }
        }

        return $bios;
    }

    /**
     * @param  array<int, string>  $urls  artist id => wikipedia api url
     * @return array<int, \Illuminate\Http\Client\PendingRequest>
     */
    private function requests(Pool $pool, array $urls): array
    {
        $requests = [];

        foreach ($urls as $id => $url) {
            $requests[] = $pool
                // unique pool key per artist, otherwise responses collide
                ->as('bio-'.$id)
                ->timeout(8)
                ->withUserAgent(self::USER_AGENT)
                ->get($url);
        }

        return $requests;
    }

    private function language(): string
    {
        return function_exists('settings')
            ? (string) settings('wikipedia_language', 'en')
            : 'en';
    }
}