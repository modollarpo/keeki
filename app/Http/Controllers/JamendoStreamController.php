<?php namespace App\Http\Controllers;

use Common\Core\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;

class JamendoStreamController extends BaseController
{
    private function getClientId(): string
    {
        return (string) (settings('jamendo.client_id') ?: '983a02d9');
    }

    public function search(Request $request)
    {
        $query = $request->get('q') ?: $request->get('query');
        if (!$query) {
            return $this->success(['data' => []]);
        }

        try {
            $response = Http::timeout(20)
                ->withHeaders(['User-Agent' => 'BeMusic/1.0'])
                ->get('https://api.jamendo.com/v3.0/tracks/', [
                    'client_id' => $this->getClientId(),
                    'format' => 'json',
                    'namesearch' => $query,
                    'limit' => 20,
                ]);

            if ($response->successful()) {
                $results = [];
                $tracks = $response->json('results', []);
                foreach ($tracks as $track) {
                    $id = Arr::get($track, 'id');
                    $title = Arr::get($track, 'name');
                    $artist = Arr::get($track, 'artist_name');
                    $duration = Arr::get($track, 'duration');
                    $image = Arr::get($track, 'image') ?? Arr::get($track, 'album_image');
                    $audio = Arr::get($track, 'audio');
                    if ($id && $audio) {
                        $results[] = [
                            'id' => $id,
                            'title' => $title,
                            'artist' => $artist,
                            'duration' => $duration,
                            'image' => $image,
                            'url' => $audio,
                        ];
                    }
                }
                return $this->success(['data' => $results]);
            } else {
                Log::warning('Jamendo search failed: ' . $response->body());
            }
        } catch (\Throwable $e) {
            Log::error('Jamendo search exception: ' . $e->getMessage());
        }

        return $this->success(['data' => []]);
    }

    public function show(string $trackId)
    {
        if (!is_numeric($trackId)) {
            abort(404, 'Invalid Jamendo track ID.');
        }

        try {
            $response = Http::timeout(20)
                ->withHeaders(['User-Agent' => 'BeMusic/1.0'])
                ->get('https://api.jamendo.com/v3.0/tracks/', [
                    'client_id' => $this->getClientId(),
                    'format' => 'json',
                    'id' => $trackId,
                ]);

            if ($response->successful()) {
                $track = Arr::first($response->json('results', []));
                $audio = Arr::get($track, 'audio');
                if ($audio) {
                    return $this->success(['url' => $audio]);
                }
            }
        } catch (\Throwable $e) {
            Log::error('Jamendo show exception: ' . $e->getMessage());
        }

        abort(404, 'Could not resolve Jamendo stream.');
    }
}
