<?php
/**
 * Create the Spotlight channel and add it to the landing page.
 * Idempotent: safe to run multiple times.
 */
require '/var/www/bemusic/vendor/autoload.php';
$app = require '/var/www/bemusic/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Channel;
use Illuminate\Support\Facades\DB;

echo "=== Creating Spotlight channel ===\n";

$channel = Channel::query()->where('slug', 'spotlight')->first();
if (!$channel) {
    $channel = new Channel();
    $channel->name = 'Spotlight Artists';
    $channel->slug = 'spotlight';
    $channel->type = 'channel';
    $channel->public = true;
    $channel->description = 'Featured artists promoted on Keeki';
    $channel->config = json_encode([
        'contentType' => 'listAll',
        'contentModel' => 'spotlight',
        'contentOrder' => 'position:asc',
        'layout' => 'grid',
        'nestedLayout' => 'carousel',
        'seoTitle' => 'Spotlight Artists',
    ]);
    $channel->save();
    echo "Created channel id={$channel->id}\n";
} else {
    echo "Channel already exists id={$channel->id}\n";
}

echo "\n=== Adding landing section ===\n";
$settings = DB::table('settings')->where('name', 'landingPage.value')->first();
$sections = $settings ? json_decode($settings->value, true) : [];

$hasSpotlight = false;
foreach ($sections as $s) {
    if (($s['name'] ?? '') === 'channel' && ($s['channelId'] ?? null) == $channel->id) {
        $hasSpotlight = true;
        break;
    }
}

if (!$hasSpotlight) {
    $sections[] = [
        'name' => 'channel',
        'title' => 'Spotlight Artists',
        'channelId' => (string) $channel->id,
        'badge' => 'Featured',
        'description' => 'Discover artists featured by our editorial team',
        'background' => 'default',
        'spacing' => 'default',
        'align' => 'left',
    ];
    DB::table('settings')->where('name', 'landingPage.value')->update([
        'value' => json_encode($sections),
    ]);
    echo "Added spotlight section to landing page\n";
} else {
    echo "Spotlight section already exists\n";
}

echo "\nALL DONE\n";