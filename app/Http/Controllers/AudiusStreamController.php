<?php namespace App\Http\Controllers;

use Common\Core\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Arr;

class AudiusStreamController extends BaseController
{
    private const DISCOVERY_NODE = 'https://discoveryprovider.audius.co';

    public function search(Request $request)
    {
        $query = $request->get('q') ?: $request->get('query');
        if (!$query) {
            return $this->success(['data' => []]);
        }

        try {
            $response = Http::timeout(8)
                ->withHeaders(['User-Agent' => 'BeMusic/1.0'])
                ->get(self::DISCOVERY_NODE . '/v1/tracks/search', [
                    'query' => $query,
                ]);

            if ($response->successful()) {
                $tracks = $response->json('data', []);
                $results = [];
                foreach ($tracks as $track) {
                    $id = Arr::get($track, 'id');
                    $title = Arr::get($track, 'title');
                    $artist = Arr::get($track, 'user.name');
                    $duration = Arr::get($track, 'duration');
                    $artwork = Arr::get($track, 'artwork.480x480') ?? Arr::get($track, 'artwork.150x150');
                    if ($id) {
                        $results[] = [
                            'id' => $id,
                            'title' => $title,
                            'artist' => $artist,
                            'duration' => $duration,
                            'image' => $artwork,
                            'url' => self::DISCOVERY_NODE . '/v1/tracks/' . $id . '/stream',
                        ];
                    }
                }
                return $this->success(['data' => $results]);
            }
        } catch (\Throwable $e) {
            // fallback empty
        }

        return $this->success(['data' => []]);
    }

    public function show(string $trackId)
    {
        if (!preg_match('/^[a-zA-Z0-9]+$/', $trackId)) {
            abort(404, 'Invalid Audius track ID.');
        }

        $url = self::DISCOVERY_NODE . '/v1/tracks/' . $trackId . '/stream';
        
        // Verify stream URL or return directly (Audius stream URLs redirect or serve audio directly)
        return $this->success(['url' => $url]);
    }
}
