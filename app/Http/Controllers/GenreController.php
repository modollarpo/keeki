<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use App\Services\Genres\PaginateGenres;
use Common\Core\Demo\BlockedOnDemoSite;
use Common\Database\QueryBuilder\FiltersList;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class GenreController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('index', Genre::class);

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
            Genre::filterableFields(),
            $data,
        ))->toArray();

        $pagination = (new PaginateGenres())->asApiResponse(
            $data,
            builder: Genre::query()->withCount('artists'),
            loader: 'editGenreDatatable',
        );

        return response()->json(['pagination' => $pagination]);
    }

    #[BlockedOnDemoSite]
    public function store(Request $request)
    {
        Gate::authorize('store', Genre::class);

        $data = $request->validate([
            'name' => 'required|unique:genres',
            'display_name' => 'nullable|string',
            'image' => 'string|nullable',
            'popularity' => 'nullable|integer|min:1|max:100',
        ]);

        $genre = Genre::create([
            'name' => slugify($data['name']),
            'display_name' => $data['display_name'] ?? $data['name'],
            'image' => $data['image'] ?? null,
            'popularity' => $data['popularity'] ?? null,
        ]);

        return response()->json(['genre' => $genre]);
    }

    #[BlockedOnDemoSite]
    public function update(int $id, Request $request)
    {
        Gate::authorize('update', Genre::class);

        $data = $request->validate([
            'name' => Rule::unique('genres')->ignore($id),
            'display_name' => 'nullable|string',
            'image' => 'string|nullable',
            'popularity' => 'nullable|integer|min:1|max:100',
        ]);

        if (!empty($data['name'])) {
            $data['name'] = slugify($data['name']);
        }

        $genre = Genre::findOrFail($id);
        $genre->update($data);

        return response()->json(['genre' => $genre]);
    }

    #[BlockedOnDemoSite]
    public function destroy(string $ids)
    {
        $genreIds = explode(',', $ids);
        Gate::authorize('destroy', [Genre::class, $genreIds]);

        Genre::destroy($genreIds);

        return response()->noContent();
    }
}
