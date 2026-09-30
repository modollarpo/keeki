<?php

namespace App\Console\Commands;

use App\Models\Artist;
use App\Traits\ScopesByCountry;
use Illuminate\Console\Command;

class SeedCountryDemoArtists extends Command
{
    protected $signature = 'channels:country:seed-demo
        {--dry-run : Report what would be created without writing anything}';

    protected $description = 'Seed clearly-labelled demo artists so per-country channels have content';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $path = resource_path('defaults/channels/country-demo-artists.json');

        if (!is_file($path)) {
            $this->error("Missing config: {$path}");

            return self::FAILURE;
        }

        $markets = json_decode(file_get_contents($path), true);

        if (!is_array($markets) || !$markets) {
            $this->error("Config is empty or invalid: {$path}");

            return self::FAILURE;
        }

        $created = 0;
        $skipped = 0;

        foreach ($markets as $market) {
            $code = ScopesByCountry::normalizeCountryCode($market['country']);

            if ($code === null) {
                $this->warn("Skipping {$market['country']}: not an upper-case ISO alpha-2 code");

                continue;
            }

            $existing = Artist::query()->inCountry($code)->count();

            if ($existing > 0) {
                $this->line("[skip] {$code} ({$market['countryName']}) already has {$existing} matching artist(s)");
                $skipped++;

                continue;
            }

            foreach ($market['artists'] as $demo) {
                if ($dryRun) {
                    $this->line("[dry-run] would seed '{$demo['name']}' in {$code}");
                    $created++;

                    continue;
                }

                $name = '[Demo] ' . $demo['name'];

                $artist = Artist::where('name', $name)->first();

                if (!$artist) {
                    $artist = Artist::create([
                        'name' => $name,
                        'verified' => true,
                    ]);
                }

                $artist->profile()->updateOrCreate(
                    ['artist_id' => $artist->id],
                    [
                        'country' => $code,
                        'city' => $demo['city'] ?? null,
                        'description' => "Demo artist for the {$market['countryName']} channel. Safe to delete.",
                    ],
                );

                $created++;
            }
        }

        if ($dryRun) {
            $this->newLine();
            $this->info("[dry-run] done: {$created} artist(s) would be created, {$skipped} market(s) already covered.");

            return self::SUCCESS;
        }

        $this->newLine();
        $this->info("Done: seeded {$created} demo artist(s), {$skipped} market(s) already had content.");
        $this->comment('Demo artists are prefixed "[Demo]" and can be removed in Admin > Artists.');

        return self::SUCCESS;
    }
}