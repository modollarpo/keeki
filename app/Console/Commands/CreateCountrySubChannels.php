<?php

namespace App\Console\Commands;

use App\Models\Artist;
use App\Models\Channel;
use App\Models\Genre;
use App\Models\Playlist;
use App\Models\Track;
use App\Models\User;
use App\Traits\ScopesByCountry;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Turns each country channel into a Spotify-style hub.
 *
 * The parents in country-channels.json used to be flat `listAll` artist grids.
 * A listAll channel ignores the `channelables` pivot entirely (see
 * LoadChannelContent::paginateAllContentFromDatabase), so sub-channels and
 * curated playlists attached to it would never render. This command rewrites
 * each parent into a `manual` / `channel` hub and attaches the sections to it.
 *
 * It is safe to run before or after channels:country, and safe to re-run - the
 * parent config, every section and every playlist track list are reconciled in
 * place rather than appended to.
 */
class CreateCountrySubChannels extends Command
{
    protected $signature = 'channels:country:expand
        {--dry-run : Report what would change without writing anything}
        {--only=* : Limit to specific ISO codes, eg --only=NG,GB}';

    protected $description = 'Expand each country channel into a hub of sub-channels, playlists and genres';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $only = array_map('strtoupper', (array) $this->option('only'));

        $path = resource_path('defaults/channels/country-markets.json');

        if (!is_file($path)) {
            $this->error("Missing config: {$path}");

            return self::FAILURE;
        }

        $markets = json_decode(file_get_contents($path), true);

        if (!is_array($markets) || !$markets) {
            $this->error("Config is empty or invalid: {$path}");

            return self::FAILURE;
        }

        $this->info('Country channel expansion: '.count($markets).' markets');

        if ($dryRun) {
            $this->comment('[dry-run] no writes will be performed.');
        }

        $this->newLine();

        $rows = [];
        $warnings = 0;

        foreach ($markets as $market) {
            $code = ScopesByCountry::normalizeCountryCode($market['code'] ?? null);

            if ($code === null) {
                $this->warn('Skipping market: invalid or missing code');
                $warnings++;

                continue;
            }

            if ($only && !in_array($code, $only, true)) {
                continue;
            }

            $parent = Channel::where('slug', 'country-'.Str::lower($code))->first();

            if (!$parent) {
                $this->error(
                    "[{$code}] parent channel 'country-".Str::lower($code)."' does not exist. "
                        .'Run channels:country first.',
                );
                $warnings++;

                continue;
            }

            try {
                $rows[] = $this->expandMarket($code, $market, $parent, $dryRun);
            } catch (\Throwable $e) {
                // Never leave a country page blank. If anything went wrong while
                // building the hub, put the market back on a plain country artist
                // grid, which degrades to what it showed before this command.
                $this->error("[{$code}] expansion failed: ".$e->getMessage());
                $this->revertToArtistGrid($parent, $code, $market, $dryRun);
                $warnings++;
            }
        }

        if (!$rows) {
            $this->newLine();
            $this->error('Nothing to expand. No markets matched.');

            return self::FAILURE;
        }

        $this->newLine();
        $this->table(
            ['ISO', 'Market', 'Artists', 'Tracks', 'Playlists', 'Styles', 'Sections'],
            $rows,
        );

        $this->newLine();

        if ($warnings) {
            $this->warn($warnings.' market(s) skipped - see messages above.');
        }

        $this->info(
            ($dryRun ? '[dry-run] ' : '').'Country hubs expanded: '.count($rows).' market(s).',
        );

        return self::SUCCESS;
    }

    private function expandMarket(
        string $code,
        array $market,
        Channel $parent,
        bool $dryRun,
    ): array {
        $this->line("<info>{$code}</info> {$market['name']} (parent #{$parent->id})");

        $this->makeHub($parent, $code, $market, $dryRun);

        $artists = Artist::query()->inCountry($code)->get();
        $tracks = Track::query()->inCountry($code)->get();

        $playlistIds = $this->syncPlaylists($code, $market, $tracks, $dryRun);
        $genreIds = $this->resolveGenreIds($market);

        // sections, in display order
        $sections = [];

        $sections[] = $this->ensureSection($code, 'artists', 0, [
            'name' => 'Top '.($market['adjective'] ?? $market['name']).' Artists',
            'config' => $this->listAllConfig($code, 'artist', 'popularity:desc', 'grid'),
        ], $dryRun);

        $sections[] = $this->ensureSection($code, 'tracks', 1, [
            'name' => 'Popular Tracks',
            'config' => $this->listAllConfig($code, 'track', 'popularity:desc', 'trackTable'),
        ], $dryRun);

        $sections[] = $this->ensureSection($code, 'albums', 2, [
            'name' => 'New Releases',
            'config' => $this->listAllConfig($code, 'album', 'release_date:desc', 'grid'),
        ], $dryRun);

        $sections[] = $this->ensureSection($code, 'playlists', 3, [
            'name' => ($market['name'] ?? $code).' Playlists',
            'config' => $this->manualConfig('playlist', 'grid'),
        ], $dryRun, ['playlists' => $playlistIds]);

        $sections[] = $this->ensureSection($code, 'genres', 4, [
            'name' => 'Music Styles',
            'config' => $this->manualConfig('genre', 'grid'),
        ], $dryRun, ['genres' => $genreIds]);

        // one channel per feature genre, holding that genre's artists from this market
        $order = 5;

        foreach ($market['featureGenres'] ?? [] as $genreSlug) {
            $genre = Genre::where('name', slugify($genreSlug))->first();

            if (!$genre) {
                $this->warn("  [{$code}] genre '{$genreSlug}' not found - run channels:country:seed-content first");

                continue;
            }

            $matches = $artists
                ->load('genres')
                ->filter(fn(Artist $a) => $a->genres->contains('id', $genre->id));

            if ($matches->isEmpty()) {
                $this->warn("  [{$code}] no {$genre->display_name} artists in this market yet");

                continue;
            }

            $sections[] = $this->ensureSection(
                $code,
                'genre-'.slugify($genreSlug),
                $order++,
                [
                    'name' => $genre->display_name.' in '.($market['name'] ?? $code),
                    'config' => $this->manualConfig('artist', 'grid'),
                ],
                $dryRun,
                ['artists' => $matches->pluck('id')->all()],
            );
        }

        if (!$dryRun) {
            // nest the sections under the hub. syncWithoutDetaching rather than
            // sync() so a channel an admin added by hand is never wiped by a deploy
            $parent->channels()->syncWithoutDetaching(
                collect($sections)
                    ->mapWithKeys(fn(array $s) => [$s['id'] => ['order' => $s['order']]])
                    ->all(),
            );
            // nested channel pages are cached against updated_at
            $parent->touch();
        }

        $this->line(sprintf(
            '  %d artist(s), %d track(s), %d playlist(s), %d style tile(s), %d section(s)',
            $artists->count(),
            $tracks->count(),
            $playlistIds->count(),
            $genreIds->count(),
            count($sections),
        ));

        return [
            $code,
            $market['name'] ?? $code,
            $artists->count(),
            $tracks->count(),
            $playlistIds->count(),
            $genreIds->count(),
            count($sections),
        ];
    }

    /**
     * Fallback used when a market could not be expanded: restore the flat
     * listAll artist grid so the country page still shows that market's artists.
     */
    private function revertToArtistGrid(Channel $parent, string $code, array $market, bool $dryRun): void
    {
        if ($dryRun) {
            return;
        }

        $parent->config = array_merge($parent->config ?? [], [
            'contentType' => 'listAll',
            'contentModel' => 'artist',
            'contentCountry' => $code,
            'contentOrder' => 'popularity:desc',
            'layout' => 'grid',
            'nestedLayout' => 'grid',
            'countryName' => $market['name'] ?? $code,
        ]);

        $parent->save();

        $this->warn("  [{$code}] reverted to a plain artist grid so the page is not empty.");
    }

    /**
     * Converts the parent into a `manual` / `channel` hub while keeping every
     * other config key - `contentCountry` is what channels:country maps the geo
     * homepage from, so it has to survive untouched.
     */
    private function makeHub(Channel $parent, string $code, array $market, bool $dryRun): void
    {
        $config = array_merge($parent->config ?? [], [
            'contentType' => 'manual',
            'contentModel' => 'channel',
            'contentOrder' => 'channelables.order:asc',
            'nestedLayout' => 'grid',
            'contentCountry' => $code,
            'countryName' => $market['name'] ?? $code,
            'countryFlag' => $market['flag'] ?? null,
        ]);

        if ($dryRun) {
            return;
        }

        $parent->config = $config;

        if (empty($parent->description)) {
            $parent->description = 'Artists, tracks, albums and playlists from '.($market['name'] ?? $code);
        }

        $parent->save();
    }

    /**
     * Creates or updates one section channel. $attach maps a relation name to
     * the model ids a `manual` section should hold.
     */
    private function ensureSection(
        string $code,
        string $suffix,
        int $order,
        array $attrs,
        bool $dryRun,
        array $attach = [],
    ): array {
        $slug = 'country-'.Str::lower($code).'-'.slugify($suffix);

        $existing = Channel::where('slug', $slug)->first();

        if ($dryRun) {
            return ['id' => $existing?->id ?? 0, 'order' => $order];
        }

        $section = $existing ?: new Channel();

        $section->fill([
            'name' => $attrs['name'],
            'slug' => $slug,
            'type' => 'channel',
            'public' => true,
            'internal' => false,
            'config' => array_merge($attrs['config'], [
                'seoTitle' => $attrs['name'].' - {{site_name}}',
                'seoDescription' => $attrs['description'] ?? 'Browse '.$attrs['name'].' on {{site_name}}.',
            ]),
        ])->save();

        foreach ($attach as $relation => $ids) {
            if (empty($ids)) {
                continue;
            }

            $section->{$relation}()->syncWithoutDetaching(
                collect($ids)
                    ->mapWithKeys(fn($id, $index) => [$id => ['order' => $index]])
                    ->all(),
            );
        }

        return ['id' => $section->id, 'order' => $order];
    }

    private function listAllConfig(string $code, string $model, string $order, string $layout): array
    {
        return [
            'contentType' => 'listAll',
            'contentModel' => $model,
            'contentCountry' => $code,
            'contentOrder' => $order,
            'layout' => $layout,
            'nestedLayout' => $layout === 'trackTable' ? 'compactGrid' : 'carousel',
        ];
    }

    private function manualConfig(string $model, string $layout): array
    {
        return [
            'contentType' => 'manual',
            'contentModel' => $model,
            'contentOrder' => 'channelables.order:asc',
            'layout' => $layout,
            'nestedLayout' => $layout === 'trackTable' ? 'compactGrid' : 'carousel',
        ];
    }

    /**
     * Curated, localized playlists. A playlist carries no country data of its
     * own, so each one is built from the market's own tracks and then attached
     * to the market's playlist section.
     *
     * @return \Illuminate\Support\Collection<int>
     */
    private function syncPlaylists(string $code, array $market, $tracks, bool $dryRun)
    {
        $definitions = $market['playlists'] ?? [];

        if (!$definitions) {
            return collect();
        }

        if ($dryRun) {
            return collect($definitions)->pluck('name');
        }

        $ownerId = app(User::class)->findAdmin()?->id ?? 1;
        $ids = collect();

        foreach ($definitions as $definition) {
            $size = (int) ($definition['size'] ?? 20);

            $picked = $this->pickTracks(
                $tracks,
                $definition['order'] ?? 'popular',
                $size,
                $definition['name'],
            );

            if ($picked->isEmpty()) {
                $this->warn(
                    "  [{$code}] playlist '{$definition['name']}' skipped - no tracks in this market",
                );

                continue;
            }

            $playlist = Playlist::firstOrNew([
                'name' => $definition['name'],
                'owner_id' => $ownerId,
            ]);

            $playlist->fill([
                'description' => $definition['description'] ?? null,
                'public' => true,
                'collaborative' => false,
            ])->save();

            // re-syncing the whole list keeps re-runs idempotent and lets the
            // catalogue grow without duplicating rows
            $playlist->tracks()->sync(
                $picked->mapWithKeys(fn($track, $i) => [$track->id => ['position' => $i]])->all(),
            );

            $playlist->editors()->syncWithoutDetaching([$ownerId]);

            $ids->push($playlist->id);
        }

        return $ids;
    }

    /**
     * Deterministically selects up to $size tracks for a playlist.
     *
     * @param  string  $order  popular | fresh | shuffle
     */
    private function pickTracks($tracks, string $order, int $size, string $seed)
    {
        $sorted = match ($order) {
            'fresh' => $tracks->sortByDesc('created_at'),
            // deterministic, unlike shuffle(), so re-running keeps positions stable
            'shuffle' => $tracks->sortBy(fn(Track $t) => crc32($t->id.'|'.$seed)),
            default => $tracks->sortByDesc('plays'),
        };

        return $sorted->values()->take($size);
    }

    private function resolveGenreIds(array $market)
    {
        $names = array_values(array_filter($market['genres'] ?? [], fn($g) => is_string($g) && $g !== ''));

        if (!$names) {
            return collect();
        }

        return Genre::whereIn('name', array_map('slugify', $names))->pluck('id');
    }
}