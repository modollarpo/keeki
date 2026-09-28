<?php

namespace App\Console\Commands;

use App\Models\Artist;
use App\Models\Channel;
use App\Traits\ScopesByCountry;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CreateCountryChannels extends Command
{
    protected $signature = 'channels:country
        {--dry-run : Report what would change without writing anything}
        {--include-empty : Map countries even when they have no artists}
        {--no-geo : Create the channels but do not touch homepage.geo_countries}';

    protected $description = 'Create/refresh the per-country music channels and wire them to the geo homepage';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $includeEmpty = (bool) $this->option('include-empty');
        $updateGeo = !$this->option('no-geo');

        $path = resource_path('defaults/channels/country-channels.json');

        if (!is_file($path)) {
            $this->error("Missing config: {$path}");

            return self::FAILURE;
        }

        $configs = json_decode(file_get_contents($path), true);

        if (!is_array($configs) || !$configs) {
            $this->error("Config is empty or invalid: {$path}");

            return self::FAILURE;
        }

        $rows = [];
        $mapped = [];
        $skipped = [];

        $this->info(
            'Country channels: '.count($configs).' markets, profile column: profile_details.country'
        );
        $this->newLine();

        foreach ($configs as $config) {
            $code = ScopesByCountry::normalizeCountryCode(
                Arr::get($config, 'config.contentCountry'),
            );

            if ($code === null) {
                $this->warn(
                    'Skipping '.$config['slug'].': invalid or missing config.contentCountry',
                );
                $skipped[] = $config['slug'];

                continue;
            }

            // the real check: how much content would this channel actually show?
            $artistCount = $this->countArtistsIn($code);

            $existing = Channel::where('slug', $config['slug'])->first();
            $action = $existing ? 'update' : 'create';
            $id = $existing?->id;

            if (!$dryRun) {
                $channel = Channel::updateOrCreate(
                    ['slug' => $config['slug']],
                    array_merge(
                        Arr::except($config, ['presetDescription', 'nestedChannels']),
                        [
                            'type' => 'channel',
                            'public' => true,
                            'internal' => (bool) ($config['internal'] ?? false),
                        ],
                    ),
                );
                $id = $channel->id;
            }

            $hasContent = $artistCount > 0;

            $rows[] = [
                $code,
                $config['config']['countryName'] ?? $code,
                $action,
                $id ?? '-',
                $artistCount,
                $hasContent ? 'yes' : 'EMPTY',
            ];

            if ($hasContent || $includeEmpty) {
                if ($id) {
                    $mapped[$code] = $id;
                }
            } else {
                $skipped[] = $code;
            }
        }

        $this->table(
            ['ISO', 'Market', 'Action', 'Channel ID', 'Artists', 'Content'],
            $rows,
        );

        $empty = array_values(
            array_filter(
                $rows,
                fn ($r) => $r[5] === 'EMPTY',
            ),
        );

        if ($empty) {
            $this->newLine();
            $this->warn(
                count($empty).
                    ' market(s) have no artists with a matching profile country. Their '
                    .'channel is still created, but they are not mapped to the geo '
                    .'homepage unless you pass --include-empty.',
            );
            $this->warn(
                'This usually means artist profile country data is missing or stored in a '
                    .'different format than the configured codes.',
            );

            $this->diagnoseCountryData();
        }

        if (!$updateGeo) {
            $this->newLine();
            $this->info('Skipped geo mapping (--no-geo).');

            return self::SUCCESS;
        }

        if (!$mapped) {
            $this->newLine();
            $this->error(
                'No market has artists, so there is nothing to map. '
                    .'homepage.geo_countries was left unchanged.',
            );

            return self::SUCCESS;
        }

        if ($dryRun) {
            $this->newLine();
            $this->info('[dry-run] would set homepage.geo_countries:');

            if ($mapped) {
                $this->line(json_encode($mapped, JSON_PRETTY_PRINT));
            }

            $this->newLine();
            $this->comment(
                $mapped
                    ? 'Run without --dry-run to apply the above.'
                    : 'Nothing to map yet, because channel IDs only exist once the channels '
                        .'are created. Re-run without --dry-run to see the final mapping.',
            );

            return self::SUCCESS;
        }

        // merge with any existing mapping so hand-added countries survive
        $existingMap = json_decode(settings('homepage.geo_countries') ?: '{}', true);
        $existingMap = is_array($existingMap) ? $existingMap : [];

        $merged = array_merge($existingMap, $mapped);

        settings()->save([
            'homepage.geo_countries' => json_encode($merged),
        ]);

        $this->newLine();
        $countryWord = count($merged) === 1 ? 'country' : 'countries';
        $this->info(
            "homepage.geo_countries now maps ".count($merged)." {$countryWord}.",
        );
        $this->line(json_encode($merged, JSON_PRETTY_PRINT));

        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->newLine();
            $this->comment(
                'Remember to configure a MaxMind GeoIP database, '
                    .'otherwise geo detection cannot resolve a country.',
            );
        }

        return self::SUCCESS;
    }

    /**
     * Uses the same scope the channels themselves filter on, so the reported
     * count can never disagree with what a visitor would actually see.
     */
    private function countArtistsIn(string $iso2): int
    {
        return Artist::query()->inCountry($iso2)->count();
    }

    /**
     * When markets come back empty the fix is either "no country data" or "the
     * data is in another format" (lowercase, full country name, 3-letter code).
     * Show what is actually stored rather than leaving the operator to guess.
     */
    private function diagnoseCountryData(): void
    {
        $total = DB::table('profile_details')->whereNotNull('country')->count();

        $this->warn(
            $total === 0
                ? 'No artist has a profile country at all (profile_details.country is null everywhere).'
                : $total.' artist profile(s) have a country, but none match the configured codes.',
        );

        $seen = DB::table('profile_details')
            ->whereNotNull('country')
            ->select('country', DB::raw('count(*) as total'))
            ->groupBy('country')
            ->orderByDesc('total')
            ->limit(12)
            ->get();

        if ($seen->isEmpty()) {
            return;
        }

        $this->newLine();
        $this->comment('Most common values stored in profile_details.country:');

        foreach ($seen as $row) {
            $normalizes = ScopesByCountry::normalizeCountryCode($row->country) === null
                ? '  <- not ISO alpha-2, will never match'
                : '';

            $this->line(sprintf('    %-12s %6d%s', "'".$row->country."'", $row->total, $normalizes));
        }

        $this->newLine();
        $this->comment(
            'Codes must be upper-case ISO 3166-1 alpha-2 (eg NG, GB). If the values above '
                .'are lower-case or 3-letter, normalise that column before running this again.',
        );
    }
}
