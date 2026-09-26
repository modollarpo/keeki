<?php

namespace App\Console\Commands;

use App\Models\Track;
use App\Services\Providers\Youtube\YoutubeAudioSearch;
use Illuminate\Console\Command;

class ResolveYoutubeSources extends Command
{
    protected $signature =
        'music:resolve-youtube-sources {--limit=250} {--pause=0.2}';

    protected $description =
        'Proactively resolve and persist YouTube sources for tracks that have none.';

    public function handle(): void
    {
        $limit = (int) $this->option('limit');
        $pause = (float) $this->option('pause');

        $tracks = Track::whereNotNull('deezer_id')
            ->where(function ($q) {
                $q->whereNull('src')->orWhere('src', '');
            })
            ->limit($limit)
            ->get();

        if (!$tracks->count()) {
            $this->info('No tracks without a source.');
            return;
        }

        $this->output->progressStart($tracks->count());
        $resolved = 0;

        foreach ($tracks as $track) {
            $artist =
                $track->artists()->orderByDesc('primary')->first()?->name ??
                '';
            if ($track->name && $artist) {
                try {
                    $results = (new YoutubeAudioSearch())->search(
                        $track->id,
                        $artist,
                        $track->name,
                    );
                    if (count($results)) {
                        $resolved++;
                    }
                } catch (\Throwable $e) {
                    $this->error("track {$track->id}: {$e->getMessage()}");
                }
            }
            $this->output->progressAdvance();
            usleep((int) ($pause * 1_000_000));
        }

        $this->output->progressFinish();
        $this->info("Resolved $resolved / {$tracks->count()} tracks.");
    }
}