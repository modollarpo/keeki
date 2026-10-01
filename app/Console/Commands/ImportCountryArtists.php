<?php namespace App\Console\Commands;

use App\Models\Artist;
use App\Services\Artists\DetectArtistCountry;
use App\Services\Artists\WikipediaArtistBioFetcher;
use App\Services\Providers\DataObjects\FetchArtistOptions;
use App\Services\Providers\MusicMetadataProvider;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Imports real artists for the country markets from Deezer.
 *
 * Mapping the existing catalogue filled the markets the catalogue already
 * covered (US, NG, GB, FR) but left GH, IN, JP and others empty, because a
 * Deezer-derived catalogue simply does not contain many documented artists from
 * them. This command closes that gap with a curated list of well-known,
 * unambiguous artists per market.
 *
 * Two phases, because they have different costs and different failure modes:
 *
 *   1. resolve each curated name against Deezer and import the artist with its
 *      albums and tracks. Deezer needs no credentials and is not throttled.
 *   2. fetch the Wikipedia lead for what was just imported, at a polite pace,
 *      and tag the artist only if the biography agrees with the curated market.
 *
 * That last condition is the safety net: the curated list says who should be
 * where, but the biography gets a veto. An artist whose lead resolves to a
 * different country is reported, never tagged, so a mistake in the curated list
 * cannot silently poison a market.
 */
class ImportCountryArtists extends Command
{
    protected $signature = 'channels:country:import-real
        {--country=* : Restrict to these ISO-2 markets (default: all configured countries)}
        {--limit=0 : Maximum artists to import in this run (0 = no limit)}
        {--pause=0.8 : Seconds between Wikipedia requests}
        {--min-confidence=0.8 : Only tag when the biography is at least this confident}
        {--dry-run : Resolve and report, import nothing}';

    protected $description = 'Import curated real artists per country market from Deezer and verify their country from Wikipedia';

    public function handle(
        DetectArtistCountry $detector,
        WikipediaArtistBioFetcher $fetcher,
    ): int {
        $dryRun = (bool) $this->option('dry-run');
        $pause = max(0.0, (float) $this->option('pause'));
        $minConfidence = (float) $this->option('min-confidence');
        $limit = max(0, (int) $this->option('limit'));

        $plan = $this->plan();

        if ($plan === []) {
            $this->line('<comment>nothing to import</comment>');

            return self::SUCCESS;
        }

        $this->line($dryRun ? '<info>DRY RUN - nothing will be imported or tagged</info>' : '<info>IMPORTING</info>');
        $this->line('planned: '.$this->describe($plan));
        $this->newLine();

        $provider = new MusicMetadataProvider('deezer');
        $imported = [];
        $skipped = 0;
        $unresolved = 0;
        $budget = $limit;

        foreach ($plan as $market => $artists) {
            foreach ($artists as $name) {
                if ($limit > 0 && $budget <= 0) {
                    break 2;
                }

                if ($this->alreadyMapped($name, $market)) {
                    $skipped++;
                    continue;
                }

                $match = $this->resolveArtist($provider, $name);

                if (!$match) {
                    $unresolved++;
                    $this->line("  $market  $name -> NO DEEZER MATCH");
                    continue;
                }

                if ($dryRun) {
                    $imported[$market][] = ['name' => $name, 'deezerId' => $match['id'], 'artist' => null];
                    $budget--;
                    $this->line("  $market  $name -> deezer:{$match['id']} (".$match['matched'].')');

                    continue;
                }

                $artist = $provider->importArtist(
                    $match['id'],
                    new FetchArtistOptions(importSimilarArtists: false, importAlbums: true),
                );

                if (!$artist) {
                    $unresolved++;
                    $this->line("  $market  $name -> IMPORT FAILED");
                    continue;
                }

                $budget--;
                $imported[$market][] = ['name' => $name, 'deezerId' => $match['id'], 'artist' => $artist];

                $this->line(sprintf(
                    '  %s  %s -> deezer:%s albums=%d tracks=%d',
                    $market,
                    Str::limit($artist->name, 26),
                    $match['id'],
                    $artist->albums()->count(),
                    $artist->tracks()->count(),
                ));
            }
        }

        $this->newLine();
        $this->tagImported($imported, $detector, $fetcher, $pause, $minConfidence, $dryRun);

        $this->newLine();
        $this->line('<info>totals</info>');
        $this->line('  imported:  '.count(array_merge(...array_values($imported) ?: [[]])));
        $this->line('  skipped:   '.$skipped.' (already mapped)');
        $this->line('  unresolved: '.$unresolved);

        return self::SUCCESS;
    }

    /**
     * Phase two: read a country out of each freshly imported biography and tag
     * only the ones that agree with the curated market.
     *
     * @param  array<string, array<int, array{name: string, deezerId: int|string, artist: Artist|null}>>  $imported
     */
    private function tagImported(
        array $imported,
        DetectArtistCountry $detector,
        WikipediaArtistBioFetcher $fetcher,
        float $pause,
        float $minConfidence,
        bool $dryRun,
    ): void {
        if ($imported === []) {
            return;
        }

        if ($dryRun) {
            $this->line('<info>tagging</info>');
            $this->line('  skipped: dry run, biographies are fetched and verified during import');

            return;
        }

        $artists = collect();

        foreach ($imported as $batch) {
            foreach ($batch as $entry) {
                if ($entry['artist']) {
                    $artists->push($entry['artist']->load('profile'));
                }
            }
        }

        $withBio = $artists->filter(fn (Artist $a) => filled($a->profile?->description));
        $needsBio = $artists->reject(fn (Artist $a) => filled($a->profile?->description));

        $bios = $needsBio->isNotEmpty()
            ? $fetcher->fetchMany($needsBio, $pause)
            : [];

        $this->line('<info>tagging</info>');
        $this->line(sprintf(
            '  %d from stored bio, %d fetched from Wikipedia',
            $withBio->count(),
            $needsBio->count(),
        ));

        $tagged = 0;
        $mismatched = 0;
        $unresolved = 0;
        $rows = [];

        foreach ($imported as $market => $batch) {
            foreach ($batch as $entry) {
                $artist = $entry['artist'];

                if (!$artist) {
                    continue;
                }

                $bio = $withBio->contains($artist)
                    ? (string) $artist->profile?->description
                    : ($bios[$artist->id]['bio'] ?? null);

                if (!$bio) {
                    $unresolved++;
                    $rows[] = sprintf('  %-3s %-26s NO BIO', $market, Str::limit($artist->name, 26));
                    continue;
                }

                $result = $detector->detect($bio, $artist->name);

                if (!$result['code'] || $result['confidence'] < $minConfidence) {
                    $unresolved++;
                    $rows[] = sprintf(
                        '  %-3s %-26s unresolved (conf=%s, top=%s)',
                        $market,
                        Str::limit($artist->name, 26),
                        $result['confidence'],
                        $result['all'][0]['code'] ?? '--',
                    );

                    continue;
                }

                if ($result['code'] !== $market) {
                    // the biography disagrees with the curated list: report, never tag
                    $mismatched++;
                    $rows[] = sprintf(
                        '  %-3s %-26s biography says %s (%s) - not tagged',
                        $market,
                        Str::limit($artist->name, 26),
                        $result['code'],
                        $result['name'],
                    );

                    continue;
                }

                if (!$dryRun) {
                    $artist->profile()->updateOrCreate(
                        ['artist_id' => $artist->id],
                        ['description' => $bio, 'country' => $market],
                    );
                }

                $tagged++;
                $rows[] = sprintf(
                    '  %-3s %-26s tagged %s (conf=%s)',
                    $market,
                    Str::limit($artist->name, 26),
                    $market,
                    $result['confidence'],
                );
            }
        }

        if ($rows) {
            $this->line(implode(PHP_EOL, $rows));
        }

        $this->line("tagged: $tagged, biography disagreed: $mismatched, unresolved: $unresolved");
    }

    /**
     * Curated artists for the requested markets, minus any already in use.
     *
     * @return array<string, array<int, string>>
     */
    private function plan(): array
    {
        $path = base_path('resources/defaults/channels/country-real-artists.json');

        if (!file_exists($path)) {
            return [];
        }

        $requested = array_map('strtoupper', (array) $this->option('country'));
        $plan = [];

        foreach ((array) (json_decode(file_get_contents($path), true) ?: []) as $market) {
            $code = strtoupper((string) ($market['country'] ?? ''));
            $names = array_values(array_filter((array) ($market['artists'] ?? [])));

            if ($code === '' || $names === []) {
                continue;
            }

            if ($requested !== [] && !in_array($code, $requested, true)) {
                continue;
            }

            $plan[$code] = $names;
        }

        return $plan;
    }

    /**
     * Find the Deezer artist whose name best matches the curated name.
     *
     * A curated name that resolves to a different artist would import the wrong
     * catalogue entry, so the match has to be close enough.
     *
     * @return array{id: int|string, matched: string}|null
     */
    private function resolveArtist(MusicMetadataProvider $provider, string $name): ?array
    {
        $search = $provider->getProvider()?->search($name, 1, 5, ['artist']);

        $candidates = $search?->artists['data'] ?? collect();

        if ($candidates->isEmpty()) {
            return null;
        }

        $needle = $this->normalizeName($name);
        $best = null;
        $bestScore = 0.0;

        foreach ($candidates as $candidate) {
            $score = $this->similarity($needle, $this->normalizeName((string) $candidate->name));

            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $candidate;
            }
        }

        if (!$best || $bestScore < 0.72) {
            return null;
        }

        return [
            'id' => $best->externalId,
            'matched' => $best->name,
        ];
    }

    private function normalizeName(string $name): string
    {
        $ascii = Str::ascii($name);

        $ascii = Str::lower(
            preg_replace('/[^a-z0-9 ]+/i', ' ', $ascii) ?? '',
        );

        return trim(preg_replace('/\s+/', ' ', $ascii) ?? '');
    }

    private function similarity(string $a, string $b): float
    {
        if ($a === '' || $b === '') {
            return 0.0;
        }

        if ($a === $b) {
            return 1.0;
        }

        return similar_text($a, $b) / max(strlen($a), strlen($b));
    }

    private function alreadyMapped(string $name, string $market): bool
    {
        return Artist::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->whereHas('profile', fn ($p) => $p->where('country', $market))
            ->exists();
    }

    /**
     * @param  array<string, array<int, string>>  $plan
     */
    private function describe(array $plan): string
    {
        $parts = [];

        foreach ($plan as $market => $names) {
            $parts[] = "$market=".count($names);
        }

        return implode(' ', $parts);
    }
}