<?php

use App\Console\Commands\ImportCountryArtists;
use App\Console\Commands\ImportMissingLyrics;
use App\Console\Commands\ResetDemoAdminAccount;
use App\Console\Commands\ResolveYoutubeSources;
use App\Console\Commands\SeedSampleData;
use Common\Channels\UpdateAllChannelsContent;
use Illuminate\Support\Facades\Schedule;

Schedule::command(UpdateAllChannelsContent::class)
    ->dailyAt('03:20')
    ->withoutOverlapping();

// Proactively resolve (and persist) a playable YouTube source for tracks that
// have none, so first-play is instant and quota/spam friendly.
Schedule::command(ResolveYoutubeSources::class)
    ->dailyAt('02:50')
    ->name('resolve-youtube-sources')
    ->withoutOverlapping()
    ->onOneServer();

// Channel refresh ingests content via DB upserts, which bypass Eloquent
// model events (and thus Scout indexing). Re-index synchronously so
// automatically imported records stay searchable.
Schedule::call(function () {
    config(['scout.queue' => false]);
    \Illuminate\Support\Facades\Artisan::call('scout:import', [
        'model' => \App\Models\Track::class,
    ]);
    \Illuminate\Support\Facades\Artisan::call('scout:import', [
        'model' => \App\Models\Album::class,
    ]);
    \Illuminate\Support\Facades\Artisan::call('scout:import', [
        'model' => \App\Models\Artist::class,
    ]);
    \Illuminate\Support\Facades\Artisan::call('scout:import', [
        'model' => \App\Models\Playlist::class,
    ]);
    \Illuminate\Support\Facades\Artisan::call('scout:import', [
        'model' => \App\Models\Tag::class,
    ]);
})->dailyAt('03:40')
    ->name('reindex-search')
    ->withoutOverlapping()
    ->onOneServer();

// Bulk-import lyrics (LRCLIB/Google, keyless) for tracks missing them.
Schedule::command(ImportMissingLyrics::class, ['--limit' => 150])
    ->dailyAt('04:10')
    ->name('import-missing-lyrics')
    ->withoutOverlapping()
    ->onOneServer();

// Backfill the country markets the Deezer-derived catalogue cannot cover on its
// own (GH, IN, JP and the thinner ones) by importing a curated list of real
// artists, then verifying each one's country against its own Wikipedia bio.
// Resumable: already-mapped artists are skipped without touching the network.
Schedule::command(ImportCountryArtists::class, ['--limit' => 40])
    ->dailyAt('04:30')
    ->name('import-country-artists')
    ->withoutOverlapping()
    ->onOneServer();

// Regenerate the sitemap XMLs (stock App\Services\SitemapGenerator).
Schedule::command('sitemap:generate')
    ->weeklyOn(0, '05:00')
    ->name('sitemap-generate')
    ->withoutOverlapping()
    ->onOneServer();

if (config('app.demo')) {
    Schedule::command(ResetDemoAdminAccount::class)
        ->dailyAt('03:30')
        ->withoutOverlapping();

    if (str_contains(config('app.url'), 'bemusic.2')) {
        Schedule::command(SeedSampleData::class)
            ->weeklyOn(6, '1:30');
    }
}
