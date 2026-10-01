<?php

namespace App\Console\Commands;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Track;
use App\Traits\ScopesByCountry;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Gives every configured market real (demo) albums and tracks.
 *
 * The country channels for tracks/albums use `contentType: listAll` and simply
 * query the database filtered by the artist's country, so a market with artists
 * but no music shows an empty page. Playlists are worse: `Channel::allPlaylists()`
 * hard-filters `has('tracks')`, so a playlist with no tracks never renders at all.
 *
 * This command tops each market up to a target number of tracks per artist and
 * creates the genres the genre sub-channels look for. It is idempotent: an artist
 * that already has enough tracks is left alone, and track names are derived
 * deterministically from the market config.
 */
class SeedCountryDemoContent extends Command
{
    protected $signature = 'channels:country:seed-content
        {--dry-run : Report what would be created without writing anything}
        {--tracks=15 : Tracks to ensure per country artist}
        {--albums=1 : Albums to ensure per country artist}';

    protected $description = 'Seed demo albums, tracks and genres so per-country channels and playlists have content';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $tracksPerArtist = max(1, (int) $this->option('tracks'));
        $albumsPerArtist = max(1, (int) $this->option('albums'));

        $markets = $this->markets();

        if ($markets === null) {
            return self::FAILURE;
        }

        $totals = ['artists' => 0, 'tracks' => 0, 'albums' => 0, 'genres' => 0];

        $rows = [];

        foreach ($markets as $market) {
            $code = ScopesByCountry::normalizeCountryCode($market['code'] ?? null);

            if ($code === null) {
                $this->warn('Skipping market: invalid or missing code');

                continue;
            }

            $artists = Artist::query()->inCountry($code)->get();

            if ($artists->isEmpty()) {
                $this->warn("[skip] {$code} has no artists with a matching profile country");

                continue;
            }

            $genres = $this->genresFor($market, $code, $dryRun);
            $totals['genres'] += $genres->count();

            $tracksMade = 0;
            $albumsMade = 0;

            foreach ($artists as $artist) {
                if (!$dryRun && $genres->isNotEmpty()) {
                    $this->attachGenres($artist->genres(), $genres);
                }

                $albumsMade += $this->ensureAlbums($artist, $market, $albumsPerArtist, $genres, $dryRun);
                $tracksMade += $this->ensureTracks($artist, $market, $tracksPerArtist, $genres, $dryRun);
            }

            $totals['artists'] += $artists->count();
            $totals['tracks'] += $tracksMade;
            $totals['albums'] += $albumsMade;

            $rows[] = [
                $code,
                $market['name'] ?? $code,
                $artists->count(),
                $albumsMade,
                $tracksMade,
                $genres->count(),
            ];
        }

        $this->newLine();
        $this->table(
            ['ISO', 'Market', 'Artists', 'Albums+', 'Tracks+', 'Genres'],
            $rows,
        );

        $prefix = $dryRun ? '[dry-run] ' : '';

        $this->newLine();
        $this->info(
            $prefix.sprintf(
                'Done: %d artist(s) across %d markets, +%d track(s), +%d album(s), %d genre(s) available.',
                $totals['artists'],
                count($rows),
                $totals['tracks'],
                $totals['albums'],
                $totals['genres'],
            ),
        );

        if (!$dryRun) {
            $this->comment('Run channels:country:expand afterwards to build the country sub-channels and playlists.');
        }

        return self::SUCCESS;
    }

    private function markets(): ?array
    {
        $path = resource_path('defaults/channels/country-markets.json');

        if (!is_file($path)) {
            $this->error("Missing config: {$path}");

            return null;
        }

        $markets = json_decode(file_get_contents($path), true);

        if (!is_array($markets) || !$markets) {
            $this->error("Config is empty or invalid: {$path}");

            return null;
        }

        return $markets;
    }

    /**
     * Resolves (creating when missing) the genres a market should be tagged with.
     * Names are slugified on insert, so display names are supplied explicitly -
     * slugify("r-and-b") would otherwise surface as "R&b" on the genre tiles.
     */
    private function genresFor(array $market, string $code, bool $dryRun)
    {
        $names = array_values(
            array_filter($market['genres'] ?? [], fn($g) => is_string($g) && $g !== ''),
        );

        if (!$names) {
            return collect();
        }

        $tags = array_map(
            fn(string $name) => [
                'name' => slugify($name),
                'display_name' => $this->genreLabel($name),
            ],
            $names,
        );

        if ($dryRun) {
            return collect($tags);
        }

        $genres = app(Genre::class)->insertOrRetrieve($tags);

        $this->fixAutoGeneratedLabels($genres, $tags);

        return $genres;
    }

    /**
     * insertOrRetrieve never touches an existing row, so genres created by an
     * earlier run keep whatever display name they were first given (eg "Mpb").
     * Only overwrite names that still look auto-generated, so a label an admin
     * has deliberately curated is never clobbered.
     */
    private function fixAutoGeneratedLabels($genres, array $tags): void
    {
        foreach ($tags as $tag) {
            $genre = $genres->firstWhere('name', $tag['name']);

            if (!$genre) {
                continue;
            }

            $current = trim((string) $genre->display_name);

            $looksAutoGenerated = $current === ''
                || $current === $tag['name']
                || $current === Str::headline($tag['name'])
                || $current === ucwords(str_replace('-', ' ', $tag['name']));

            if ($looksAutoGenerated && $current !== $tag['display_name']) {
                $genre->display_name = $tag['display_name'];
                $genre->save();
            }
        }
    }

    private function genreLabel(string $slug): string
    {
        $labels = [
            'mpb' => 'MPB',
            'r-and-b' => 'R&B',
            'hip-hop' => 'Hip-Hop',
            'drum-and-bass' => 'Drum & Bass',
            'brazilian-pop' => 'Brazilian Pop',
            'latin-pop' => 'Latin Pop',
            'indian-hip-hop' => 'Indian Hip-Hop',
            'k-indie' => 'K-Indie',
            'j-pop' => 'J-Pop',
            'k-pop' => 'K-Pop',
            'afrobeat' => 'Afrobeat',
            'amapiano' => 'Amapiano',
            'gqom' => 'Gqom',
            'highlife' => 'Highlife',
            'hiplife' => 'Hiplife',
            'indie-pop' => 'Indie Pop',
        ];

        return $labels[$slug] ?? Str::headline($slug);
    }

    /**
     * Genres are attached with syncWithoutDetaching so re-running never removes
     * tags an admin added by hand.
     */
    private function attachGenres($relation, $genres): void
    {
        $relation->syncWithoutDetaching(
            $genres->map(fn($genre) => $genre->id)->all(),
        );
    }

    private function ensureAlbums(
        Artist $artist,
        array $market,
        int $target,
        $genres,
        bool $dryRun,
    ): int {
        $existing = $artist->albums()->count();

        if ($existing >= $target) {
            return 0;
        }

        if ($dryRun) {
            return $target - $existing;
        }

        $created = 0;
        $base = $market['albumTitle'] ?? 'Demo Album';

        for ($i = $existing; $i < $target; $i++) {
            $album = Album::firstOrNew(['name' => $this->albumName($artist, $base, $i)]);

            if (!$album->exists) {
                $album->fill([
                    'name' => $album->name,
                    // spread across the last few months so "new releases" has an order
                    'release_date' => Carbon::now()
                        ->subDays(random_int(2, 120))
                        ->format('Y-m-d'),
                    'image' => $artist->image_small ?: null,
                    'plays' => random_int(500, 90000),
                ])->save();
            }

            $artist->albums()->syncWithoutDetaching([$album->id]);
            $this->attachGenres($album->genres(), $genres);
            $created++;
        }

        return $created;
    }

    private function albumName(Artist $artist, string $base, int $index): string
    {
        $title = $index === 0 ? $base : "{$base} Vol. ".($index + 1);

        // scoping by artist keeps two artists in one market from resolving to the
        // same album through firstOrNew(); the loop is just belt-and-braces
        $candidate = "{$title} - {$artist->name}";

        while (Album::where('name', $candidate)->exists()) {
            $candidate .= ' (Reissue)';
        }

        return $candidate;
    }

    private function ensureTracks(
        Artist $artist,
        array $market,
        int $target,
        $genres,
        bool $dryRun,
    ): int {
        $existing = $artist->tracks()->count();

        if ($existing >= $target) {
            return 0;
        }

        $titles = $market['trackTitles'] ?? [];

        if (!$titles) {
            $titles = ['Demo Track'];
        }

        if ($dryRun) {
            return $target - $existing;
        }

        $albumIds = $artist->albums()->pluck('albums.id')->all();
        $created = 0;

        for ($i = $existing; $i < $target; $i++) {
            $name = $this->trackName($artist, $titles, $i);

            $track = Track::firstOrNew(
                ['name' => $name, 'album_id' => $albumIds[$i % max(1, count($albumIds))] ?? null],
            );

            if (!$track->exists) {
                $track->fill([
                    'name' => $track->name,
                    'number' => ($i % 10) + 1,
                    'duration' => random_int(95, 320) * 1000,
                    'image' => $artist->image_small ?: null,
                    'plays' => random_int(200, 250000),
                    'created_at' => Carbon::now()->subDays(random_int(1, 300)),
                ])->save();
            }

            $artist->tracks()->syncWithoutDetaching([$track->id => ['primary' => true]]);
            $this->attachGenres($track->genres(), $genres);
            $created++;
        }

        return $created;
    }

    private function trackName(Artist $artist, array $titles, int $index): string
    {
        // deterministic + artist-scoped, so re-running after a partial failure
        // resumes exactly where it stopped instead of duplicating or cross-linking
        $candidate = "{$titles[$index % count($titles)]} - {$artist->name}";

        while (Track::where('name', $candidate)->exists()) {
            $candidate .= ' (Reprise)';
        }

        return $candidate;
    }
}