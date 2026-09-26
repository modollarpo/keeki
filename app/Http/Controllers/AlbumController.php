<?php namespace App\Http\Controllers;

use App\Http\Requests\ModifyAlbums;
use App\Models\Album;
use App\Services\Albums\CrupdateAlbum;
use App\Services\Albums\DeleteAlbums;
use App\Services\Albums\AlbumLoader;
use App\Services\Albums\PaginateAlbums;
use App\Services\IncrementModelViews;
use Common\Core\Demo\BlockedOnDemoSite;
use Common\Core\Rendering\RendersClientSideApp;
use Common\Database\QueryBuilder\FiltersList;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

class AlbumController extends Controller
{
    use RendersClientSideApp;

    public function index(Request $request)
    {
        Gate::authorize('index', Album::class);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'image' => 'string',
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
            Album::filterableFields(),
            $data,
        ))->toArray();

        $pagination = (new PaginateAlbums())->asApiResponse(
            $data,
            includeScheduled: true,
            loader: 'editAlbumDatatable',
        );

        return response()->json(['pagination' => $pagination]);
    }

    public function show(Album $album)
    {
        Gate::authorize('show', $album);

        $loader = request('loader', 'albumPage');
        $data = (new AlbumLoader())->load($album, $loader);

        (new IncrementModelViews())->execute($album->id, 'album');

        return $this->clientSideOrPrerenderedResponse([
            'pageName' => $loader === 'albumPage' ? 'album-page' : null,
            'loader' => $loader,
            'data' => $data,
        ]);
    }

    #[BlockedOnDemoSite]
    public function update(Album $album, ModifyAlbums $request)
    {
        Gate::authorize('update', $album);

        $album = app(CrupdateAlbum::class)->execute($request->all(), $album);

        return response()->json(['album' => $album]);
    }

    #[BlockedOnDemoSite]
    public function store(ModifyAlbums $request)
    {
        Gate::authorize('store', Album::class);

        $album = app(CrupdateAlbum::class)->execute($request->all());

        return response()->json(['album' => $album]);
    }

    #[BlockedOnDemoSite]
    public function destroy(string $ids)
    {
        $albumIds = explode(',', $ids);
        Gate::authorize('destroy', [Album::class, $albumIds]);

        app(DeleteAlbums::class)->execute($albumIds);

        return response()->noContent();
    }
}
