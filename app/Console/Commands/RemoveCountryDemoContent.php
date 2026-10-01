<?php namespace App\Console\Commands;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Track;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

/**
 * Removes the seeded demo content from the country channels.
 *
 * The demo seeder was necessary to give every market a populated hub while the
 * catalogue was still empty, and it is now a liability: it attached albums and
 * tracks to *every* artist in a country, real ones included, so those pages mix
 * invented tracks with real ones.
 *
 * This deletes only what the seeder could have produced, matched against the
 * same per-market config the seeder used. Anything not matching that shape is
 * left alone, so a real release is never removed by name collision.
 *
 * Safe by default: it reports what it would delete and writes a JSON backup. It
 * only deletes with --apply.
 */
class RemoveCountryDemoContent extends Command
{
    protected $signature = 'channels:country:remove-demo
        {--country=* : Restrict to these ISO-2 markets (default: all configured countries)}
        {--apply : Actually delete. Without this, only a report is printed.}';

    protected $description = 'Remove the seeded demo artists, albums and tracks from the country channels';

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $requested = array_map('strtoupper', (array) $this->option('country'));

        $markets = $this->markets($requested);

        if ($markets === []) {
            $this->line('<comment>no configured markets</comment>');

            return self::SUCCESS;
        }

        $report = [
            'artists' => [],
            'albums' => [],
            'tracks' => [],
        ];

        foreach ($markets as $code => $market) {
            $this->cleanMarket($code, $market, $report);
        }

        $counts = [
            'artists' => count($report['artists']),
            'albums' => count($report['albums']),
            'tracks' => count($report['tracks']),
        ];

        $this->newLine();
        $this->line('<info>demo content found</info>');
        $this->line('  artists: '.$counts['artists']);
        $this->line('  albums:  '.$counts['albums']);
        $this->line('  tracks:  '.$counts['tracks']);

        if (! $apply) {
            $this->newLine();
            $this->line('<comment>dry run - nothing deleted. Re-run with --apply.</comment>');

            return self::SUCCESS;
        }

        if ($counts['artists'] + $counts['albums'] + $counts['tracks'] === 0) {
            $this->line('nothing to do');

            return self::SUCCESS;
        }

        $this->delete($report);

        $this->newLine();
        $this->info(sprintf(
            'Deleted %d artist(s), %d album(s), %d track(s).',
            $counts['artists'],
            $counts['albums'],
            $counts['tracks'],
        ));
        $this->comment('Re-run channels:country:expand to rebuild the sections and playlists.');

        return self::SUCCESS;
    }

    /**
     * @param  array{artists: array<int, array<string, mixed>>, albums: array<int, array<string, mixed>>, tracks: array<int, array<string, mixed>>}  $report
     */
    private function cleanMarket(string $code, array $market, array &$report): void
    {
        $albumBase = (string) ($market['albumTitle'] ?? 'Demo Album');
        $trackTitles = $market['trackTitles'] ?: ['Demo Track'];

        foreach (Artist::query()->inCountry($code)->get() as $artist) {
            $name = preg_quote($artist->name, '/');

            // "<base> - <artist>", "<base> Vol. 2 - <artist>", each optionally
            // suffixed "(Reissue)" by the seeder's collision handling
            $albumPattern = '/^'
                .preg_quote($albumBase, '/')
                .'(?: Vol\. \d+)?(?: \(Reissue\))* - '
                .$name
                .'$/u';

            $titleAlternatives = array_map(
                fn (string $title) => preg_quote($title, '/'),
                $trackTitles,
            );

            $trackPattern = '/^(?:'
                .implode('|', $titleAlternatives)
                .')(?: \(Reprise\))* - '
                .$name
                .'$/u';

            foreach ($artist->albums()->get() as $album) {
                if (preg_match($albumPattern, (string) $album->name)) {
                    $report['albums'][] = $this->snapshotAlbum($album);
                }
            }

            foreach ($artist->tracks()->get() as $track) {
                if (preg_match($trackPattern, (string) $track->name)) {
                    $report['tracks'][] = $this->snapshotTrack($track);
                }
            }

            // the placeholder artists themselves, named "[Demo] ..." by the seeder
            if (str_starts_with((string) $artist->name, '[Demo]')) {
                $report['artists'][] = ['id' => $artist->id, 'name' => $artist->name];
            }
        }
    }

    private function snapshotAlbum(Album $album): array
    {
        return ['id' => $album->id, 'name' => $album->name];
    }

    private function snapshotTrack(Track $track): array
    {
        return ['id' => $track->id, 'name' => $track->name, 'album_id' => $track->album_id];
    }

    /**
     * @param  array{artists: array<int, array<string, mixed>>, albums: array<int, array<string, mixed>>, tracks: array<int, array<string, mixed>>}  $report
     */
    private function delete(array $report): void
    {
        $backup = storage_path('app/country-demo-backup-'.Carbon::now()->format('Ymd-His').'.json');

        File::ensureDirectoryExists(dirname($backup));
        File::put($backup, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->line('backup: '.$backup);

        $trackIds = array_column($report['tracks'], 'id');
        $albumIds = array_column($report['albums'], 'id');

        // pivots first: they are plain rows and would otherwise be orphaned
        foreach (['artist_track', 'playlist_track'] as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'track_id')) {
                DB::table($table)->whereIn('track_id', $trackIds)->delete();
            }
        }

        if (Schema::hasTable('artist_album')) {
            DB::table('artist_album')->whereIn('album_id', $albumIds)->delete();
        }

        foreach (['artist_bios', 'artist_genre', 'genre_artist', 'album_genre', 'track_genre'] as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            foreach (['album_id' => $albumIds, 'artist_id' => array_column($report['artists'], 'id'), 'track_id' => $trackIds] as $column => $ids) {
                if ($ids && Schema::hasColumn($table, $column)) {
                    DB::table($table)->whereIn($column, $ids)->delete();
                }
            }
        }

        Track::whereIn('id', $trackIds)->get()->each->delete();
        Album::whereIn('id', $albumIds)->get()->each->delete();

        foreach ($report['artists'] as $artist) {
            $model = Artist::find($artist['id']);

            if (! $model) {
                continue;
            }

            // anything still attached to a demo artist goes with it
            DB::table('artist_track')->where('artist_id', $model->id)->delete();
            DB::table('artist_album')->where('artist_id', $model->id)->delete();
            DB::table('profile_details')->where('artist_id', $model->id)->delete();
            $model->delete();
        }
    }

    /**
     * @param  array<int, string>  $requested
     * @return array<string, array<string, mixed>>
     */
    private function markets(array $requested): array
    {
        $path = base_path('resources/defaults/channels/country-markets.json');

        if (! file_exists($path)) {
            return [];
        }

        $all = (array) (json_decode(file_get_contents($path), true) ?: []);
        $out = [];

        foreach ($all as $market) {
            $code = strtoupper((string) ($market['code'] ?? ''));

            if ($code === '') {
                continue;
            }

            if ($requested !== [] && ! in_array($code, $requested, true)) {
                continue;
            }

            $out[$code] = $market;
        }

        return $out;
    }
}