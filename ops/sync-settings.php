<?php
/**
 * Idempotent production settings sync. Runs from ops/ inside the app dir,
 * both on deploy (deploy.yml step 7) and manually on the server.
 * NOTE: Laravel Tinker is NOT installed in production, so the old
 * `artisan tinker --execute=...` deploy step silently did nothing. This
 * uses a raw Laravel bootstrap instead.
 */
$appBase = realpath(__DIR__ . '/..');
require $appBase . '/vendor/autoload.php';
$app = require $appBase . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Common\Settings\Models\Setting;

$updates = [
    // Branding: Keekii 516x117 logo pair (white for dark bg / black for light bg)
    'branding.logo_dark'           => 'storage/branding-images/keekii-logo-dark.png',
    'branding.logo_light'          => 'storage/branding-images/keekii-logo-light.png',
    // Direct-stream fallback: absolute yt-dlp binary path
    'youtube.yt_dlp_binary'        => '/usr/local/bin/yt-dlp',
    // YouTube embed origin rotation via Piped instances
    'youtube.piped_instances'      => 'https://pipedapi.kavin.rocks,https://pipedapi.adminforge.de,https://api.piped.private.coffee,https://pipedapi.reallyaweso.me,https://pipedapi.ducks.party,https://pipedapi.orangenet.cc,https://pipedapi-libre.kavin.rocks,https://pipedapi.nosebs.ru,https://pipedapi.leptons.xyz,https://piped-api.privacy.com.de',
    // Jamendo catalog search (royalty-free)
    'jamendo.client_id'            => '983a02d9',
    // LRCLIB lyrics integration — make the lyrics UI reachable
    'player.hide_lyrics'           => false,
    'player.hide_lyrics_button'    => false,
];

$changed = 0;
foreach ($updates as $name => $value) {
    $exists = Setting::where('name', $name)->exists();
    Setting::updateOrCreate(['name' => $name], ['value' => $value]);
    echo '[' . ($exists ? 'updated' : 'added') . "] $name\n";
    $changed++;
}
echo "Processed $changed settings.\n";
