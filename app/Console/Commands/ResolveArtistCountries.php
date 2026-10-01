<?php namespace App\Console\Commands;

use App\Models\Artist;
use App\Services\Artists\DetectArtistCountry;
use App\Services\Artists\WikipediaArtistBioFetcher;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Derives `profile_details.country` for the real (provider-backed) artists.
 *
 * Wikipedia leads state nationality almost always, so the flow is:
 *
 *   existing artist -> Wikipedia lead -> store bio -> detect country -> write country
 *
 * Once an artist has a country, the country hubs pick the artist up on their
 * own: listAll sections filter by `profile_details.country`, and albums and
 * tracks inherit the country through the `artists` pivot. Nothing else needs to
 * be wired per market.
 *
 * Writes only happen at or above --min-confidence. Everything weaker is listed
 * for a human to decide, because a wrong country is worse than a missing one.
 */
class ResolveArtistCountries extends Command
{
    protected $signature = 'music:resolve-artist-countries
        {--limit=400 : Maximum artists to fetch bios for in this run}
        {--batch=25 : Artists per progress report}
        {--pause=0.6 : Seconds between Wikipedia requests}
        {--min-confidence=0.8 : Only apply a country at or above this confidence}
        {--country=* : Restrict to these ISO-2 markets (default: all configured countries)}
        {--target-per-market=10 : Stop early once every market has this many real artists}
        {--include-tagged : Also re-evaluate artists that already have a country}
        {--refetch : Re-fetch Wikipedia leads for artists that already have a stored bio}
        {--dry-run : Report what would change, write nothing}';

    protected $description = 'Map real artists to countries using their Wikipedia biography';

    public function handle(
        DetectArtistCountry $detector,
        WikipediaArtistBioFetcher $fetcher,
    ): int {
        $dryRun = (bool) $this->option('dry-run');
        $limit = max(0, (int) $this->option('limit'));
        $batchSize = max(1, (int) $this->option('batch'));
        $pause = max(0, (int) $this->option('pause'));
        $minConfidence = (float) $this->option('min-confidence');
        $target = max(0, (int) $this->option('target-per-market'));

        $markets = $this->markets();

        if ($markets === []) {
            $this->line('<comment>No configured markets found in country-channels.json.</comment>');

            return self::SUCCESS;
        }

        $this->line($dryRun ? '<info>DRY RUN - nothing will be written</info>' : '<info>APPLYING changes</info>');
        $this->line('markets: '.implode(', ', $markets));
        $this->newLine();

        $counts = $this->currentRealCounts($markets);
        $this->renderCounts('starting real artists per market', $counts, $markets);

        $remaining = $limit;

        if ($target > 0 && $this->allSatisfied($counts, $markets, $target)) {
            $this->line("<info>every market already has >= $target real artists; nothing to do</info>");

            return self::SUCCESS;
        }

        $biosFetched = 0;
        $mapped = 0;
        $biosStored = 0;
        $needsReview = [];
        $reasons = [];
        $noBioSamples = [];
        $samples = [];
        $attempted = [];

        while ($remaining > 0) {
            $candidates = $this->candidates(
                min($batchSize, $remaining),
                (bool) $this->option('include-tagged'),
                (bool) $this->option('refetch'),
                $attempted,
            );

            if ($candidates->isEmpty()) {
                $this->line('<comment>no further candidates</comment>');
                break;
            }

            // Remember them before fetching, otherwise an artist that ends up
            // with a bio but no country is selected again in the next batch and
            // its Wikipedia lead is requested a second time.
            foreach ($candidates as $artist) {
                $attempted[$artist->id] = true;
            }

            $bios = $fetcher->fetchMany($candidates, $pause);

            foreach ($candidates as $artist) {
                $fetch = $bios[$artist->id] ?? ['bio' => null, 'reason' => 'no-response'];
                $bio = $fetch['bio'];

                if (!$bio) {
                    $reasons[$fetch['reason']] = ($reasons[$fetch['reason']] ?? 0) + 1;

                    if (count($noBioSamples) < 12) {
                        $noBioSamples[] = sprintf(
                            '  %-34s %s',
                            Str::limit($artist->name, 34),
                            $fetch['reason'],
                        );
                    }

                    continue;
                }

                $biosFetched++;

                if (!$dryRun) {
                    $this->storeBio($artist, $bio);
                    $biosStored++;
                }

                $result = $detector->detect($bio, $artist->name);

                if ($result['code'] && $result['confidence'] >= $minConfidence) {
                    if (!$dryRun) {
                        $this->storeCountry($artist, $result['code']);
                    }

                    $mapped++;
                    $counts[$result['code']] = ($counts[$result['code']] ?? 0) + 1;

                    if (count($samples) < 15) {
                        $samples[] = sprintf(
                            '  %-28s -> %-3s %-14s conf=%-5s rule=%s',
                            Str::limit($artist->name, 28),
                            $result['code'],
                            Str::limit((string) $result['name'], 14),
                            (string) $result['confidence'],
                            $result['all'][0]['rule'] ?? '-',
                        );
                    }
                } else {
                    $needsReview[] = sprintf(
                        '  %-28s conf=%-5s %-11s top=%s (%s)',
                        Str::limit($artist->name, 28),
                        (string) $result['confidence'],
                        $result['method'],
                        $result['all'][0]['code'] ?? '--',
                        $result['phrase'] ?? '-',
                    );
                }
            }

            $remaining -= $candidates->count();

            $this->line("processed {$candidates->count()}, mapped $mapped, remaining $remaining");

            if ($reasons['rate-limited'] ?? 0) {
                $this->line('<comment>rate limited by Wikipedia - rerun later to continue from where this stopped</comment>');
                break;
            }

            if ($target > 0 && $this->allSatisfied($counts, $markets, $target)) {
                $this->line("<info>target of $target real artists per market reached</info>");
                break;
            }
        }

        $this->newLine();

        if ($samples) {
            $this->line('<info>mapped</info>');
            $this->line(implode(PHP_EOL, $samples));
            $this->newLine();
        }

        $this->line('<info>totals</info>');
        $this->line("  bios fetched:   $biosFetched");
        $this->line($dryRun ? '  bios stored:    0 (dry run)' : "  bios stored:    $biosStored");
        $this->line("  countries set:  $mapped");
        $this->line("  needs review:   ".count($needsReview));

        if ($reasons) {
            arsort($reasons);
            $this->line("  no bio:         ".implode(' ', array_map(
                fn($reason, $count) => "$reason=$count",
                array_keys($reasons),
                $reasons,
            )));
        }

        if ($noBioSamples) {
            $this->newLine();
            $this->line('<comment>sample of artists with no bio:</comment>');
            $this->line(implode(PHP_EOL, $noBioSamples));
        }

        if ($needsReview) {
            $this->newLine();
            $this->line('<comment>below threshold - not written, review these manually:</comment>');
            $this->line(implode(PHP_EOL, array_slice($needsReview, 0, 30)));
        }

        $this->newLine();
        $this->renderCounts('real artists per market after this run', $counts, $markets);

        return self::SUCCESS;
    }

    /**
     * Real artists that could be mapped, most content first.
     *
     * Artists that already carry a stored bio are skipped by default: their
     * Wikipedia lead has been fetched and judged already, so asking again only
     * burns the rate limit and re-reports the same verdict.
     *
     * @param  array<int, true>  $attempted  ids already handled in this run
     * @return \Illuminate\Support\Collection<int, Artist>
     */
    private function candidates(
        int $limit,
        bool $includeTagged,
        bool $refetch,
        array $attempted = [],
    ) {
        return Artist::query()
            ->with('profile')
            ->withCount(['tracks', 'albums'])
            ->where('name', 'not like', '%[Demo]%')
            ->where(fn ($q) => $q->whereNotNull('deezer_id')->orWhereNotNull('spotify_id'))
            ->whereHas('tracks')
            ->when($attempted !== [], fn ($q) => $q->whereNotIn('artists.id', array_keys($attempted)))
            ->when(
                !$refetch,
                fn ($q) => $q->whereDoesntHave(
                    'profile',
                    fn ($p) => $p->whereNotNull('description')->where('description', '!=', ''),
                ),
            )
            ->when(
                !$includeTagged,
                fn ($q) => $q->whereDoesntHave('profile', fn ($p) => $p->whereNotNull('country')->where('country', '!=', '')),
            )
            ->orderByDesc('tracks_count')
            ->orderByDesc('albums_count')
            ->limit($limit)
            ->get();
    }

    /**
     * @param  array<string, string>  $bio
     */
    private function storeBio(Artist $artist, string $bio): void
    {
        $artist->profile()->updateOrCreate(
            ['artist_id' => $artist->id],
            ['description' => $bio],
        );
    }

    private function storeCountry(Artist $artist, string $code): void
    {
        DB::table('profile_details')
            ->updateOrInsert(
                ['artist_id' => $artist->id],
                ['country' => $code, 'updated_at' => now(), 'created_at' => now()],
            );
    }

    /**
     * @param  array<int, string>  $markets
     * @return array<string, int>
     */
    private function currentRealCounts(array $markets): array
    {
        $counts = [];

        foreach ($markets as $code) {
            $counts[$code] = Artist::query()
                ->inCountry($code)
                ->where(fn ($q) => $q->whereNotNull('deezer_id')->orWhereNotNull('spotify_id'))
                ->count();
        }

        return $counts;
    }

    /**
     * @param  array<int, string>  $markets
     */
    private function allSatisfied(array $counts, array $markets, int $target): bool
    {
        foreach ($markets as $code) {
            if (($counts[$code] ?? 0) < $target) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, int>  $counts
     * @param  array<int, string>  $markets
     */
    private function renderCounts(string $title, array $counts, array $markets): void
    {
        $parts = [];

        foreach ($markets as $code) {
            $parts[] = $code.'='.($counts[$code] ?? 0);
        }

        $this->line($title.': '.implode(' ', $parts));
    }

    /**
     * ISO-2 codes from the configured country channels, intersected with any
     * explicit --country filter.
     *
     * @return array<int, string>
     */
    private function markets(): array
    {
        $path = base_path('resources/defaults/channels/country-channels.json');

        $codes = [];

        if (file_exists($path)) {
            foreach ((array) (json_decode(file_get_contents($path), true) ?: []) as $entry) {
                $country = $entry['config']['contentCountry'] ?? null;

                if (is_string($country) && $country !== '') {
                    $codes[] = strtoupper($country);
                }
            }
        }

        $codes = array_values(array_unique($codes));

        $requested = array_map('strtoupper', (array) $this->option('country'));

        if ($requested !== []) {
            $codes = array_values(array_intersect($codes, $requested));
        }

        return $codes;
    }
}