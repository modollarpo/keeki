<?php namespace App\Console\Commands;

use App\Models\Artist;
use App\Services\Artists\DetectArtistCountry;
use App\Services\Artists\WikipediaArtistBioFetcher;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
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
 * An artist that already has a stored biography is judged from that text,
 * without touching the network. Only artists with no biography need a Wikipedia
 * request, which is the scarce, rate-limited part of the job.
 *
 * Writes only happen at or above --min-confidence. Everything weaker is listed
 * for a human to decide, because a wrong country is worse than a missing one.
 */
class ResolveArtistCountries extends Command
{
    protected $signature = 'music:resolve-artist-countries
        {--limit=400 : Maximum artists to judge in this run}
        {--batch=25 : Artists per batch}
        {--pause=0.8 : Seconds between Wikipedia requests}
        {--min-confidence=0.8 : Only apply a country at or above this confidence}
        {--country=* : Restrict to these ISO-2 markets (default: all configured countries)}
        {--target-per-market=0 : Stop early once every market has this many real artists}
        {--include-tagged : Also re-evaluate artists that already have a country}
        {--dry-run : Report what would change, write nothing}';

    protected $description = 'Map real artists to countries using their Wikipedia biography';

    /** @var array<string, int> */
    private array $counts = [];

    /** @var array<int, string> */
    private array $samples = [];

    /** @var array<int, string> */
    private array $needsReview = [];

    /** @var array<string, int> */
    private array $reasons = [];

    private int $mapped = 0;

    private int $biosStored = 0;

    public function handle(
        DetectArtistCountry $detector,
        WikipediaArtistBioFetcher $fetcher,
    ): int {
        $dryRun = (bool) $this->option('dry-run');
        $limit = max(0, (int) $this->option('limit'));
        $batchSize = max(1, (int) $this->option('batch'));
        $pause = max(0.0, (float) $this->option('pause'));
        $minConfidence = (float) $this->option('min-confidence');
        $target = max(0, (int) $this->option('target-per-market'));

        $markets = $this->markets();

        if ($markets === []) {
            $this->line('<comment>No configured markets found in country-channels.json.</comment>');

            return self::SUCCESS;
        }

        $this->line($dryRun ? '<info>DRY RUN - nothing will be written</info>' : '<info>APPLYING changes</info>');
        $this->line('markets: '.implode(', ', $markets));

        foreach ($markets as $code) {
            $this->counts[$code] = 0;
        }

        $this->renderCounts('starting real artists per market', $markets);
        $this->newLine();

        $remaining = $limit;
        $attempted = [];

        while ($remaining > 0) {
            $candidates = $this->candidates(
                min($batchSize, $remaining),
                (bool) $this->option('include-tagged'),
                $attempted,
            );

            if ($candidates->isEmpty()) {
                $this->line('<comment>no further candidates</comment>');
                break;
            }

            // Remember them up front: an artist judged without a country must
            // not be selected again in a later batch of the same run.
            foreach ($candidates as $artist) {
                $attempted[$artist->id] = true;
            }

            $withBio = $candidates->filter(
                fn (Artist $artist) => filled($artist->profile?->description),
            );

            $needsFetch = $candidates->reject(
                fn (Artist $artist) => filled($artist->profile?->description),
            );

            $this->line(sprintf(
                'batch: %d candidate(s), %d judged from stored bio, %d fetched from Wikipedia',
                $candidates->count(),
                $withBio->count(),
                $needsFetch->count(),
            ));

            foreach ($withBio as $artist) {
                $this->judge($artist, (string) $artist->profile->description, $detector, $dryRun, $minConfidence);
            }

            $bios = $needsFetch->isNotEmpty()
                ? $fetcher->fetchMany($needsFetch, $pause)
                : [];

            foreach ($needsFetch as $artist) {
                $fetch = $bios[$artist->id] ?? ['bio' => null, 'reason' => 'no-response'];

                if (!$fetch['bio']) {
                    $this->reasons[$fetch['reason']] = ($this->reasons[$fetch['reason']] ?? 0) + 1;
                    continue;
                }

                if (!$dryRun) {
                    $this->storeBio($artist, $fetch['bio']);
                    $this->biosStored++;
                }

                $this->judge($artist, $fetch['bio'], $detector, $dryRun, $minConfidence);
            }

            $remaining -= $candidates->count();

            $this->line("mapped {$this->mapped} so far, remaining $remaining");

            if (($this->reasons['rate-limited'] ?? 0) > 0) {
                $this->line('<comment>rate limited by Wikipedia - rerun to continue from where this stopped</comment>');
                break;
            }

            if ($target > 0 && $this->allSatisfied($markets, $target)) {
                $this->line("<info>target of $target real artists per market reached</info>");
                break;
            }
        }

        $this->report($dryRun, $markets);

        return self::SUCCESS;
    }

    /**
     * Apply (or just report) the country detected from one biography.
     */
    private function judge(
        Artist $artist,
        string $bio,
        DetectArtistCountry $detector,
        bool $dryRun,
        float $minConfidence,
    ): void {
        $result = $detector->detect($bio, $artist->name);

        if ($result['code'] && $result['confidence'] >= $minConfidence) {
            if (!$dryRun) {
                $this->storeCountry($artist, $result['code']);
            }

            $this->mapped++;
            $this->counts[$result['code']] = ($this->counts[$result['code']] ?? 0) + 1;

            if (count($this->samples) < 15) {
                $this->samples[] = sprintf(
                    '  %-28s -> %-3s %-14s conf=%-5s rule=%s',
                    Str::limit($artist->name, 28),
                    $result['code'],
                    Str::limit((string) $result['name'], 14),
                    (string) $result['confidence'],
                    $result['all'][0]['rule'] ?? '-',
                );
            }

            return;
        }

        $this->needsReview[] = sprintf(
            '  %-28s conf=%-5s %-11s top=%s (%s)',
            Str::limit($artist->name, 28),
            (string) $result['confidence'],
            $result['method'],
            $result['all'][0]['code'] ?? '--',
            $result['phrase'] ?? '-',
        );
    }

    /**
     * Real artists that could be mapped, most content first.
     *
     * @param  array<int, true>  $attempted  ids already handled in this run
     * @return Collection<int, Artist>
     */
    private function candidates(int $limit, bool $includeTagged, array $attempted)
    {
        return Artist::query()
            ->with('profile')
            ->withCount(['tracks', 'albums'])
            ->where('name', 'not like', '%[Demo]%')
            ->where(fn ($q) => $q->whereNotNull('deezer_id')->orWhereNotNull('spotify_id'))
            ->whereHas('tracks')
            ->when($attempted !== [], fn ($q) => $q->whereNotIn('artists.id', array_keys($attempted)))
            ->when(
                !$includeTagged,
                fn ($q) => $q->whereDoesntHave(
                    'profile',
                    fn ($p) => $p->whereNotNull('country')->where('country', '!=', ''),
                ),
            )
            ->orderByDesc('tracks_count')
            ->orderByDesc('albums_count')
            ->limit($limit)
            ->get();
    }

    private function storeBio(Artist $artist, string $bio): void
    {
        $artist->profile()->updateOrCreate(
            ['artist_id' => $artist->id],
            ['description' => $bio],
        );
    }

    private function storeCountry(Artist $artist, string $code): void
    {
        DB::table('profile_details')->updateOrInsert(
            ['artist_id' => $artist->id],
            ['country' => $code, 'created_at' => now(), 'updated_at' => now()],
        );
    }

    /**
     * @param  array<int, string>  $markets
     */
    private function allSatisfied(array $markets, int $target): bool
    {
        foreach ($markets as $code) {
            if ($this->counts[$code] < $target) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<int, string>  $markets
     */
    private function report(bool $dryRun, array $markets): void
    {
        if ($this->samples) {
            $this->newLine();
            $this->line('<info>mapped</info>');
            $this->line(implode(PHP_EOL, $this->samples));
        }

        $this->newLine();
        $this->line('<info>totals</info>');
        $this->line("  countries set:  {$this->mapped}");
        $this->line($dryRun ? '  bios stored:    0 (dry run)' : "  bios stored:    {$this->biosStored}");
        $this->line('  needs review:   '.count($this->needsReview));

        if ($this->reasons) {
            arsort($this->reasons);
            $this->line('  no bio:         '.implode(' ', array_map(
                fn($reason, $count) => "$reason=$count",
                array_keys($this->reasons),
                $this->reasons,
            )));
        }

        if ($this->needsReview) {
            $this->newLine();
            $this->line('<comment>below threshold - not written, review these manually:</comment>');
            $this->line(implode(PHP_EOL, array_slice($this->needsReview, 0, 25)));
        }

        $this->newLine();
        $this->renderCounts('real artists per market after this run', $markets);
    }

    /**
     * @param  array<int, string>  $markets
     */
    private function renderCounts(string $title, array $markets): void
    {
        $parts = [];

        foreach ($markets as $code) {
            $parts[] = $code.'='.$this->counts[$code];
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