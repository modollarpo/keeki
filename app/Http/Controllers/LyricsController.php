<?php

namespace App\Http\Controllers;

use App\Models\Lyric;
use App\Services\Lyrics\ImportLyrics;
use App\Services\Lyrics\ParseLyric;
use Common\Core\Demo\BlockedOnDemoSite;
use Common\Database\Datasource\Datasource;
use Common\Database\QueryBuilder\FiltersList;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

class LyricsController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('index', Lyric::class);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'created_at' => 'nullable',
            'created_at.*' => 'string',
            'updated_at' => 'nullable',
            'updated_at.*' => 'string',
        ]);

        if (!isset($data['sort'])) {
            $data['sort'] = 'updated_at|desc';
        }

        // map new filters format from frontend to the old Datasource format
        $data['filters'] = (new FiltersList(
            Lyric::filterableFields(),
            $data,
        ))->toArray();

        $paginator = new Datasource(
            Lyric::query()->with(['track.artists', 'track.album.artists']),
            $data,
        );

        return response()->json(['pagination' => $paginator->paginate()]);
    }

    public function show(int $trackId)
    {
        Gate::authorize('show', Lyric::class);

        $lyric = Lyric::query()->where('track_id', $trackId)->first();

        if (!$lyric && settings('player.lyrics_automate')) {
            $lyric = (new ImportLyrics())->execute(
                $trackId,
                // exact duration for the track that is currently playing, might differ from $track->duration
                request('duration'),
            );
        }

        if (!$lyric) {
            return response()->json(
                ['message' => __('Could not find lyrics'), 'errors' => []],
                404,
            );
        }

        return response()->json((new ParseLyric())->execute($lyric));
    }

    #[BlockedOnDemoSite]
    public function store(Request $request)
    {
        Gate::authorize('store', Lyric::class);

        $data = $request->validate([
            'text' => 'required|string',
            'track_id' => 'required|integer|exists:tracks,id',
            'is_synced' => 'boolean|nullable',
            'duration' => 'integer|nullable',
        ]);

        $lyric = Lyric::create($data);

        return response()->json(['lyric' => $lyric]);
    }

    #[BlockedOnDemoSite]
    public function update(int $id, Request $request)
    {
        Gate::authorize('update', Lyric::class);

        $data = $request->validate([
            'text' => 'required|string',
            'track_id' => 'required|integer|exists:tracks,id',
            'is_synced' => 'boolean|nullable',
            'duration' => 'integer|nullable',
        ]);

        $lyric = Lyric::findOrFail($id);

        $lyric->update($data);

        return response()->json(['lyric' => $lyric]);
    }

    #[BlockedOnDemoSite]
    public function destroy(string $ids)
    {
        $lyricIds = explode(',', $ids);
        Gate::authorize('destroy', [Lyric::class, $lyricIds]);

        Lyric::destroy($lyricIds);

        return response()->noContent();
    }
}
