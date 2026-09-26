<?php
// Sets the music metadata provider to Deezer and clears the settings cache.
// Idempotent; safe to run before the DB is seeded (no-ops if not ready).
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $settings = app(Common\Settings\Settings::class);
    $settings->save(['metadata_provider' => 'deezer']);
    fwrite(STDOUT, 'metadata_provider=deezer' . PHP_EOL);
} catch (Throwable $e) {
    fwrite(STDOUT, 'skipped (settings table not ready yet): ' . $e->getMessage() . PHP_EOL);
    exit(0);
}