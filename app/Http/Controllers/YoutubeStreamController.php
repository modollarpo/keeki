<?php

namespace App\Http\Controllers;

use Common\Core\BaseController;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Process\Process;

class YoutubeStreamController extends BaseController
{
    // video ids are 11 chars, [a-zA-Z0-9_-]
    private const VIDEO_ID_REGEX = '/^[a-zA-Z0-9_-]{11}$/';

    // resolves a directly playable (non-embed) audio url for a youtube video.
    // Used by the frontend as a last resort playback fallback when the embed
    // player errors out. Prefers a local yt-dlp binary if configured, then
    // falls back to public Piped API instances.
    public function show(string $videoId)
    {
        if (!preg_match(self::VIDEO_ID_REGEX, $videoId)) {
            abort(404, 'Invalid video id.');
        }

        $url = $this->viaYtDlp($videoId) ?? $this->viaPiped($videoId);

        if ($url) {
            return $this->success(['url' => $url]);
        }

        abort(404, 'Could not resolve a stream for this video.');
    }

    private function viaYtDlp(string $videoId): ?string
    {
        $binary = (string) (settings('youtube.yt_dlp_binary') ?: '/usr/local/bin/yt-dlp');
        if (!$binary || !is_file($binary) || !is_executable($binary)) {
            return null;
        }

        try {
            $process = Process::fromShellCommandline(
                '"' . $binary . '" -f "bestaudio/best" -g "https://www.youtube.com/watch?v=' . $videoId . '"',
            )->setTimeout(30)->mustRun();
            $url = trim($process->getOutput());
            if (is_string($url) && str_starts_with($url, 'https://')) {
                return $url;
            }
        } catch (\Throwable) {
            // fall through to piped
        }

        return null;
    }

    private function viaPiped(string $videoId): ?string
    {
        $instances = array_values(
            array_filter(
                array_map(
                    'trim',
                    explode(
                        ',',
                        (string) settings(
                            'youtube.piped_instances',
                            'https://pipedapi.kavin.rocks,https://pipedapi.adminforge.de,https://api.piped.private.coffee,https://pipedapi.reallyaweso.me,https://pipedapi.ducks.party,https://pipedapi.orangenet.cc,https://pipedapi-libre.kavin.rocks,https://pipedapi.nosebs.ru,https://pipedapi.leptons.xyz,https://piped-api.privacy.com.de',
                        ),
                    ),
                ),
            ),
        );

        foreach ($instances as $instance) {
            try {
                $streams = Http::timeout(8)
                    ->withHeaders(['User-Agent' => 'Keekii/1.0'])
                    ->get(rtrim($instance, '/') . '/streams/' . $videoId)
                    ->json('audioStreams');

                $audioStreams = array_values(
                    array_filter($streams ?? [], fn($s) => !$s['videoOnly']),
                );
                if (!count($audioStreams)) {
                    continue;
                }

                // pick highest bitrate audio stream with a direct http url
                usort($audioStreams, fn($a, $b) => ($b['bitrate'] ?? 0) <=> ($a['bitrate'] ?? 0));
                foreach ($audioStreams as $stream) {
                    $url = Arr::get($stream, 'url');
                    if (is_string($url) && preg_match('#^https?://#', $url)) {
                        return $this->unblockPipedProxy($url);
                    }
                }
            } catch (\Throwable) {
                // try next instance
            }
        }

        return null;
    }

    // piped instances often proxy streams through their own subdomain and
    // require the instance to be reached directly instead of via proxying
    // proxy_url. Extract the raw url if proxied.
    private function unblockPipedProxy(string $url): string
    {
        return urldecode($url);
    }
}