<?php

namespace App\Console\Commands;

use App\Models\Channel;
use Illuminate\Console\Command;

/**
 * Gives the genre sub-channels the same carousel navigation as the rest of the site.
 *
 * The genre page is a `manual` / `channel` hub, so each section renders through
 * ChannelContent with `isNested`, which means it is laid out by `nestedLayout`
 * and not by `layout`:
 *
 *   resources/client/web-player/channels/channel-content.tsx
 *     const layout = isNested ? channel.config.nestedLayout : channel.config.layout;
 *
 * sharing-channels.json has shipped `nestedLayout: carousel` for the artist and
 * album sections since the genre hub was added, but that file only ever runs on
 * a fresh install (DefaultChannelsSeeder bails out once Channel::count() > 0).
 * A database that was seeded before those keys existed kept `grid`, so the genre
 * page rendered a flat grid with no arrows while every other rail on the site
 * scrolled.
 *
 * Only channels explicitly restricted to a genre are touched. The per-country
 * genre sections (country-NG-afrobeat and friends) carry no `restriction` key,
 * so country pages are left exactly as they are.
 *
 * The track section is skipped: it is a ranked table rather than a grid, and
 * `trackTable` has no carousel equivalent.
 *
 * Safe to re-run. Only writes where the value actually differs.
 */
class UseCarouselForGenreChannels extends Command
{
    protected $signature = 'channels:genre:carousel
        {--dry-run : Report what would change without writing anything}';

    protected $description = 'Lay out the genre artist/album sections as carousels so they get navigation arrows';

    /**
     * Grid-backed genre sections that should become rails.
     */
    private const CAROUSEL_MODELS = ['artist', 'album'];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $channels = Channel::query()
            ->whereNotNull('config')
            ->get()
            ->filter(fn(Channel $channel) => $this->shouldBeCarousel($channel));

        if ($channels->isEmpty()) {
            $this->warn('No genre channels with a grid layout were found.');

            return self::SUCCESS;
        }

        if ($dryRun) {
            $this->comment('[dry-run] no writes will be performed.');
        }

        $rows = [];

        foreach ($channels as $channel) {
            $config = $channel->config;
            $before = $config['nestedLayout'] ?? '(unset)';

            $rows[] = [
                $channel->id,
                $channel->slug,
                $config['contentModel'] ?? '?',
                $before,
                'carousel',
            ];

            if ($dryRun) {
                continue;
            }

            $config['nestedLayout'] = 'carousel';

            // kept in step so the section still behaves as a rail if it is ever
            // promoted out of the genre hub and rendered top level
            if (($config['layout'] ?? null) === 'grid') {
                $config['layout'] = 'carousel';
            }

            $channel->config = $config;
            $channel->save();

            // nested channel pages are cached against updated_at
            $channel->touch();
        }

        $this->newLine();
        $this->table(['ID', 'Slug', 'Model', 'Was', 'Now'], $rows);
        $this->newLine();

        $this->info(
            ($dryRun ? '[dry-run] ' : '').'Genre sections switched to carousel: '.$channels->count().'.',
        );

        return self::SUCCESS;
    }

    private function shouldBeCarousel(Channel $channel): bool
    {
        $config = $channel->config;

        if (!is_array($config)) {
            return false;
        }

        if (($config['restriction'] ?? null) !== 'genre') {
            return false;
        }

        if (!in_array($config['contentModel'] ?? null, self::CAROUSEL_MODELS, true)) {
            return false;
        }

        return ($config['nestedLayout'] ?? null) !== 'carousel';
    }
}