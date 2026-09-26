<?php

namespace App\Services\Lyrics;

use Illuminate\Support\Facades\Http;

class LrclibLyricsProvider implements LyricsProvider
{
    public function getLyrics(
        string $artistName,
        string $trackName,
        string $albumName = null,
        int $durationInMs = null,
    ): ?array {
        $durationInSeconds = $durationInMs ? $durationInMs / 1000 : null;

        $url = "https://lrclib.net/api/search?artist_name=$artistName&track_name=$trackName";
        if ($albumName) {
            $url .= "&album_name=$albumName";
        }

        $response = Http::withHeaders([
            'User-Agent' =>
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            'Accept-Language' => 'en-US, en;q=0.5',
            'Content-Language' => 'en-us',
        ])
            ->timeout(10)
            ->get($url);

        $results = $response->json();
        $bestMatch = null;
        if (is_array($results) && !empty($results)) {
            if ($durationInMs) {
                $bestMatch = $this->getLyricsWithBestDurationMatch(
                    $results,
                    (int) round($durationInSeconds),
                );
            } elseif (isset($results[0]) && is_array($results[0])) {
                $bestMatch = $results[0];
            }
        }

        if (is_array($bestMatch)) {
            return [
                'syncedLyric' => $bestMatch['syncedLyrics'] ?? null,
                'plainLyric' => $bestMatch['plainLyrics'] ?? null,
                'duration' => $bestMatch['duration'] ?? null,
            ];
        }

        return null;
    }

    function getLyricsWithBestDurationMatch(
        array $results,
        int $targetDuration,
    ): array|null {
        return array_reduce($results, function (
            $closestItem,
            $currentItem,
        ) use ($targetDuration) {
            if (
                !is_array($currentItem) ||
                !isset($currentItem['duration']) ||
                !is_numeric($currentItem['duration'])
            ) {
                return $closestItem;
            }
            if ($closestItem === null) {
                return $currentItem;
            }

            $closestDifference = abs(
                $closestItem['duration'] - $targetDuration,
            );
            $currentDifference = abs(
                $currentItem['duration'] - $targetDuration,
            );

            return $currentDifference < $closestDifference
                ? $currentItem
                : $closestItem;
        });
    }
}
