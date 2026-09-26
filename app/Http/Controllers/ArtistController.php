<?php namespace App\Http\Controllers;

use App\Http\Requests\ModifyArtists;
use App\Models\Artist;
use App\Services\Artists\ArtistLoader;
use App\Services\Artists\CrupdateArtist;
use App\Services\Artists\DeleteArtists;
use App\Services\Artists\PaginateArtists;
use App\Services\IncrementModelViews;
use Common\Core\BaseController;
use Common\Core\Rendering\RendersClientSideApp;
use Common\Database\QueryBuilder\FiltersList;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class ArtistController extends BaseController
{
    use RendersClientSideApp;

    public function index(Request $request)
    {
        $this->authorize('index', Artist::class);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'verified' => 'string',
            'disabled' => 'string',
            'plays' => 'string',
            'views' => 'string',
            'created_at' => 'string',
            'updated_at' => 'string',
        ]);

        // map new filters format from frontend to the old Datasource format
        $data['filters'] = (new FiltersList(
            Artist::filterableFields(),
            $data,
        ))->toArray();

        $pagination = app(PaginateArtists::class)->asApiResponse(
            $data,
            builder: Artist::withCount(['albums']),
            loader: 'editArtistDatatable',
        );

        return $this->success(['pagination' => $pagination]);
    }

    public function show(Artist $artist)
    {
        $this->authorize('show', $artist);

        $loader = request('loader', 'artistPage');
        $data = (new ArtistLoader())->load($artist, $loader);

        (new IncrementModelViews())->execute($artist->id, 'artist');

        return $this->clientSideOrPrerenderedResponse([
            'pageName' => $loader === 'artistPage' ? 'artist-page' : null,
            'loader' => $loader,
            'data' => $data,
        ]);
    }

    public function store(ModifyArtists $request)
    {
        $this->authorize('store', Artist::class);

        $this->blockOnDemoSite();

        $artist = app(CrupdateArtist::class)->execute($request->all());

        return $this->success(['artist' => $artist]);
    }

    public function update(Artist $artist, ModifyArtists $request)
    {
        $this->authorize('update', $artist);

        $this->blockOnDemoSite();

        $artist = app(CrupdateArtist::class)->execute($request->all(), $artist);

        return $this->success(['artist' => $artist]);
    }

    public function destroy(string $ids)
    {
        $artistIds = explode(',', $ids);
        $this->authorize('destroy', [Artist::class, $artistIds]);

        $this->blockOnDemoSite();

        $artists = Artist::whereIn('id', $artistIds)->get();

        (new DeleteArtists())->execute($artists);

        return $this->success();
    }
}
