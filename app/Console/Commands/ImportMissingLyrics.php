<?php

namespace App\Console\Commands;

use App\Models\Track;
use App\Services\Lyrics\ImportLyrics;
use Illuminate\Console\Command;

class ImportMissingLyrics extends Command
{
    protected $signature =
        'music:import-missing-lyrics {--limit=150} {--pause=0.3}';

    protected $description =
        'Import lyrics from LRCLIB/Google for tracks that have none.';

    public function handle(): void
    {
        $limit = (int) $this->option('limit');
        $pause = (float) $this->option('pause');

        $ids = Track::whereDoesntHave('lyric')
            ->pluck('id')
            ->take($limit);

        $count = $ids->count();
        if ($count === 0) {
            $this->info('No tracks missing lyrics.');
            return;
        }
        $this->output->progressStart($count);
        $imported = 0;
        foreach ($ids as $id) {
            try {
                $ok = (new ImportLyrics())->execute((int) $id) !== null;
                $imported += $ok ? 1 : 0;
            } catch (\Throwable $e) {
                $this->error("track $id: ".$e->getMessage());
            }
            $this->output->progressAdvance();
            usleep((int) ($pause * 1_000_000));
        }
        $this->output->progressFinish();
        $this->info(
            "Lyrics imported for $imported / $count tracks (limit $limit).",
        );
    }
}