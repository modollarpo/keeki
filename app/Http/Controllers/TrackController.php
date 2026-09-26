<?php

namespace App\Http\Controllers;

use App\Http\Requests\ModifyTracks;
use App\Models\Track;
use App\Services\Tracks\CrupdateTrack;
use App\Services\Tracks\DeleteTracks;
use App\Services\Tracks\PaginateTracks;
use App\Services\Tracks\TrackLoader;
use Common\Core\Demo\BlockedOnDemoSite;
use Common\Core\Rendering\RendersClientSideApp;
use Common\Database\QueryBuilder\FiltersList;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

class TrackController extends Controller
{
    use RendersClientSideApp;

    public function index(Request $request)
    {
        Gate::authorize('index', Track::class);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'image' => 'string',
            'album_id' => 'string',
            'plays' => 'string',
            'created_at' => 'nullable',
            'created_at.*' => 'string',
            'updated_at' => 'nullable',
            'updated_at.*' => 'string',
            'artists' => 'string',
        ]);

        if (!isset($data['sort'])) {
            $data['sort'] = 'updated_at|desc';
        }

        // map new filters format from frontend to the old Datasource format
        $data['filters'] = (new FiltersList(
            Track::filterableFields(),
            $data,
        ))->toArray();

        $pagination = (new PaginateTracks())->asApiResponse(
            $data,
            builder: Track::query()->with('lyric'),
            loader: 'editTrackDatatable',
        );

        return response()->json(['pagination' => $pagination]);
    }

    public function show(Track $track)
    {
        Gate::authorize('show', $track);

        $loader = request('loader', 'trackPage');
        $data = (new TrackLoader())->load($track, $loader);

        return $this->clientSideOrPrerenderedResponse([
            'pageName' => $loader === 'trackPage' ? 'track-page' : null,
            'loader' => $loader,
            'data' => $data,
        ]);
    }

    #[BlockedOnDemoSite]
    public function store(ModifyTracks $request)
    {
        Gate::authorize('store', Track::class);

        $track = app(CrupdateTrack::class)->execute(
            $request->all(),
            null,
            $request->get('album'),
        );

        return response()->json(['track' => $track]);
    }

    #[BlockedOnDemoSite]
    public function update(Track $track, ModifyTracks $request)
    {
        Gate::authorize('update', $track);

        $track = app(CrupdateTrack::class)->execute(
            $request->all(),
            $track,
            $request->get('album'),
        );

        return response()->json(['track' => $track]);
    }

    #[BlockedOnDemoSite]
    public function destroy(string $ids)
    {
        $trackIds = explode(',', $ids);
        Gate::authorize('destroy', [Track::class, $trackIds]);

        app(DeleteTracks::class)->execute($trackIds);

        return response()->noContent();
    }
}
