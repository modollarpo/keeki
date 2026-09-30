<?php namespace App\Http\Controllers;

use App\Models\Track;
use Common\Core\BaseController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;

class PreviewStreamController extends BaseController
{
    // Resolves a temp playable stream for a track that has no stored source.
    // Deezer preview URLs are signed and expire within minutes, so each play
    // request fetches a fresh preview from the Deezer API and 302-redirects
    // the playback client to it (no bandwidth flows through this server).
    public function show(Track $track): RedirectResponse
    {
        if ($track->deezer_id) {
            $preview = Http::timeout(8)
                ->withHeaders(['User-Agent' => 'Keekii/1.0'])
                ->get("https://api.deezer.com/track/{$track->deezer_id}")
                ->json('preview');

            if (is_string($preview) && str_starts_with($preview, 'https://')) {
                return redirect($preview);
            }
        }

        abort(404, 'No streaming source available for this track.');
    }
}