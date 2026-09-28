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
use Common\Settings\Themes\CssTheme;

$updates = [
    // Branding: Keekii 900x382 logo pair (white for dark bg / black for light bg)
    'branding.logo_dark' => 'storage/branding-images/keekii-logo-dark.png',
    'branding.logo_light' => 'storage/branding-images/keekii-logo-light.png',
    // Direct-stream fallback: absolute yt-dlp binary path
    'youtube.yt_dlp_binary' => '/usr/local/bin/yt-dlp',
    // YouTube embed origin rotation via Piped instances
    'youtube.piped_instances' =>
        'https://pipedapi.kavin.rocks,https://pipedapi.adminforge.de,https://api.piped.private.coffee,https://pipedapi.reallyaweso.me,https://pipedapi.ducks.party,https://pipedapi.orangenet.cc,https://pipedapi-libre.kavin.rocks,https://pipedapi.nosebs.ru,https://pipedapi.leptons.xyz,https://piped-api.privacy.com.de',
    // Jamendo catalog search (royalty-free)
    'jamendo.client_id' => '983a02d9',
    // LRCLIB lyrics integration — make the lyrics UI reachable
    'player.hide_lyrics' => false,
    'player.hide_lyrics_button' => false,
];

$changed = 0;
foreach ($updates as $name => $value) {
    $exists = Setting::where('name', $name)->exists();
    Setting::updateOrCreate(['name' => $name], ['value' => $value]);
    echo '[' . ($exists ? 'updated' : 'added') . "] $name\n";
    $changed++;
}
echo "Processed $changed settings.\n";

/*
 * ---------------------------------------------------------------------------
 * Theme tokens ("Ember & Ink" — see docs/design-direction.md)
 * ---------------------------------------------------------------------------
 * The rendered theme comes from the `css_themes` table, NOT from
 * config/themes.php: CssThemesTableSeeder only INSERTs a theme when one is
 * missing and never updates an existing row, so editing config alone changes
 * nothing in production. This pushes the config values into the default
 * light/dark rows on every deploy, which makes config/themes.php the single
 * source of truth and the edits reviewable in a diff.
 *
 * Merge, don't replace: anything an admin has customised that is not defined in
 * config/themes.php is preserved, so this can't silently destroy a deliberate
 * per-theme tweak. Tokens explicitly listed in config/themes.php are owned by
 * the config and always win.
 */
$tokenSources = [
    'default_light' => 'light',
    'default_dark' => 'dark',
];

$themesChanged = 0;
foreach ($tokenSources as $flag => $scheme) {
    $theme = CssTheme::where('type', 'site')->where($flag, true)->first();

    if (!$theme) {
        echo "[skipped] no site theme with {$flag} = true\n";
        continue;
    }

    // CssTheme casts `values` <-> JSON via get/setValuesAttribute.
    try {
        $current = $theme->values;
    } catch (\TypeError $e) {
        // Malformed JSON in the column would otherwise fatal the whole deploy.
        echo "[error] theme '{$theme->name}' has malformed values JSON, skipping\n";
        continue;
    }
    $current = is_array($current) ? $current : [];

    $desired = config("themes.{$scheme}");

    if (!is_array($desired) || !$desired) {
        echo "[error] config/themes.php has no '{$scheme}' scheme\n";
        continue;
    }

    $merged = array_merge($current, $desired);

    if ($merged === $current) {
        echo "[unchanged] theme '{$theme->name}' already matches config/themes.php\n";
        continue;
    }

    // $guarded = [] on CssTheme, and setValuesAttribute json_encodes the array.
    $theme->values = $merged;
    $theme->save();

    $count = count(array_diff_assoc($merged, $current));
    echo "[updated] theme '{$theme->name}' ({$scheme}) — {$count} token(s) applied\n";
    $themesChanged++;
}

echo "Processed {$themesChanged} theme(s).\n";
