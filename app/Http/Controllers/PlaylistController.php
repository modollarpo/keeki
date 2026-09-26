<?php namespace App\Http\Controllers;

use App\Http\Requests\ModifyPlaylist;
use App\Models\Playlist;
use App\Services\IncrementModelViews;
use App\Services\Playlists\DeletePlaylists;
use App\Services\Playlists\PaginatePlaylists;
use App\Services\Playlists\PlaylistLoader;
use Common\Core\Demo\BlockedOnDemoSite;
use Common\Core\Rendering\RendersClientSideApp;
use Common\Database\QueryBuilder\FiltersList;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

class PlaylistController extends Controller
{
    use RendersClientSideApp;

    public function index(Request $request)
    {
        Gate::authorize('index', Playlist::class);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'public' => 'string',
            'collaborative' => 'string',
            'plays' => 'string',
            'views' => 'string',
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
            Playlist::filterableFields(),
            $data,
        ))->toArray();

        $pagination = (new PaginatePlaylists())->asApiResponse(
            $data,
            loader: 'editPlaylistDatatable',
        );

        return response()->json(['pagination' => $pagination]);
    }

    public function show(int $id)
    {
        $playlist = Playlist::findOrFail($id);

        Gate::authorize('show', $playlist);

        $loader = request('loader', 'playlistPage');
        $data = (new PlaylistLoader())->load($playlist, $loader);

        (new IncrementModelViews())->execute($playlist->id, 'playlist');

        return $this->clientSideOrPrerenderedResponse([
            'pageName' => $loader === 'playlistPage' ? 'playlist-page' : null,
            'loader' => $loader,
            'data' => $data,
        ]);
    }

    public function store(ModifyPlaylist $request)
    {
        Gate::authorize('store', Playlist::class);

        $params = $request->all();
        $params['owner_id'] = $request->user()->id;
        $newPlaylist = $request
            ->user()
            ->playlists()
            ->create($params, ['editor' => true]);

        $newPlaylist->syncUploadedImage();

        $newPlaylist->load('editors');

        return response()->json([
            'playlist' => (new PlaylistLoader())->toApiResource($newPlaylist),
        ]);
    }

    public function update(Playlist $playlist, ModifyPlaylist $request)
    {
        Gate::authorize('update', $playlist);

        $initialImage = $playlist->image;

        $playlist->fill($request->all())->save();
        $playlist->load('editors');

        $playlist->syncUploadedImage($initialImage);

        return response()->json([
            'playlist' => (new PlaylistLoader())->toApiResource($playlist),
        ]);
    }

    #[BlockedOnDemoSite]
    public function destroy(string $ids)
    {
        $playlistIds = explode(',', $ids);
        $playlists = Playlist::with('editors')
            ->whereIn('id', $playlistIds)
            ->get();

        Gate::authorize('destroy', [Playlist::class, $playlists]);

        app(DeletePlaylists::class)->execute($playlists);

        return response()->noContent();
    }

    public function follow(int $id, Request $request)
    {
        $playlist = Playlist::findOrFail($id);

        Gate::authorize('show', $playlist);

        return response()->json(
            $request
                ->user()
                ->playlists()
                ->sync([$id], false),
        );
    }

    public function unfollow(int $id, Request $request)
    {
        $playlist = $request->user()->playlists()->find($id);

        Gate::authorize('show', $playlist);

        if ($playlist) {
            $request->user()->playlists()->detach($id);
        }

        return response()->json();
    }
}
