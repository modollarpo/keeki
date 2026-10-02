<?php

namespace App\Console\Commands;

use App\Models\Channel;
use Illuminate\Console\Command;

/**
 * Gives the genre sections the same carousel navigation as the rest of the site.
 *
 * A nested channel is laid out by `nestedLayout` and a top level one by
 * `layout` (resources/client/web-player/channels/channel-content.tsx):
 *
 *   const layout = isNested ? channel.config.nestedLayout : channel.config.layout;
 *
 * sharing-channels.json already asks for `carousel` on the genre sections, but
 * that file only ever runs on a fresh install - DefaultChannelsSeeder bails out
 * once Channel::count() > 0. A database seeded before those keys existed kept
 * `grid`, and the genre page rendered a flat grid with no arrows while every
 * other rail on the site scrolled.
 *
 * Channels are matched by slug rather than by `config.restriction`, because the
 * restriction is resolved from its own columns on a channel that predates that
 * config key, and filtering on it silently matched nothing.
 *
 * The track section is left alone: it is a ranked table, and `trackTable` has no
 * carousel equivalent.
 *
 * Safe to re-run. Only writes where the value actually differs.
 */
class UseCarouselForGenreChannels extends Command
{
    protected $signature = 'channels:genre:carousel
        {--dry-run : Report what would change without writing anything}';

    protected $description = 'Lay out the genre artist/album sections as carousels so they get navigation arrows';

    /**
     * Preset slugs that show artist or album tiles, and so can be rails.
     */
    private const CAROUSEL_SLUGS = ['genre', 'genre-artists', 'genre-albums'];

    /**
     * Content models that render as tiles rather than as a ranked table.
     */
    private const TILE_MODELS = ['artist', 'album'];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $channels = Channel::whereIn('slug', self::CAROUSEL_SLUGS)->get();

        if ($channels->isEmpty()) {
            $this->error('None of the genre channels ('.implode(', ', self::CAROUSEL_SLUGS).') exist.');

            return self::FAILURE;
        }

        if ($dryRun) {
            $this->comment('[dry-run] no writes will be performed.');
        }

        $rows = [];
        $changed = 0;

        foreach ($channels as $channel) {
            $config = $channel->config;

            if (!is_array($config)) {
                $this->warn("[{$channel->slug}] config is not readable, skipped.");

                continue;
            }

            $model = $config['contentModel'] ?? '(unset)';
            $layout = $config['layout'] ?? '(unset)';
            $nested = $config['nestedLayout'] ?? '(unset)';
            $updated = $config;

            if ($model === 'channel') {
                // a hub: its sections are laid out one level down
                $rows[] = [$channel->slug, $model, $layout, $nested, 'hub, left alone'];

                continue;
            }

            if (!in_array($model, self::TILE_MODELS, true)) {
                $rows[] = [$channel->slug, $model, $layout, $nested, 'not a tile grid, left alone'];

                continue;
            }

            // whichever key actually decides this channel's own rendering
            if ($layout === 'grid') {
                $updated['layout'] = 'carousel';
            }

            if (in_array($nested, ['grid', 'compactGrid', null], true)) {
                $updated['nestedLayout'] = 'carousel';
            }

            if ($updated === $config) {
                $rows[] = [$channel->slug, $model, $layout, $nested, 'already a carousel'];

                continue;
            }

            $changed++;

            $rows[] = [
                $channel->slug,
                $model,
                $layout.' -> '.$updated['layout'],
                $nested.' -> '.($updated['nestedLayout'] ?? '(unset)'),
                $dryRun ? '[dry-run] would write' : 'written',
            ];

            if ($dryRun) {
                continue;
            }

            $channel->config = $updated;
            $channel->save();

            // nested channel pages are cached against updated_at
            $channel->touch();
        }

        $this->newLine();
        $this->table(['Slug', 'Model', 'layout', 'nestedLayout', 'Result'], $rows);
        $this->newLine();

        $this->info(
            ($dryRun ? '[dry-run] ' : '').'Genre sections switched to carousel: '.$changed.'.',
        );

        return self::SUCCESS;
    }
}