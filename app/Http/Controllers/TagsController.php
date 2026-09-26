<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\QueryBuilders\TagsQueryBuilder;
use App\Resources\TagResource;
use Common\Core\Demo\BlockedOnDemoSite;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * @tags Tags
 */
class TagsController extends Controller
{
    /**
     * List all tags.
     *
     * @operationId listTags
     */
    public function index(Request $request)
    {
        Gate::authorize('index', Tag::class);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'workspace_id' => 'string',
            'user_id' => 'integer',
            'created_at' => 'string',
            'updated_at' => 'string',
        ]);

        $pagination = (new TagsQueryBuilder($data))->paginate();

        return TagResource::collection($pagination);
    }

    /**
     * Create a tag.
     *
     * @operationId createTag
     */
    #[BlockedOnDemoSite]
    public function store(Request $request)
    {
        Gate::authorize('store', Tag::class);

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tags', 'name'),
            ],
            'display_name' => 'nullable|string|max:100',
        ]);

        $tag = Tag::create([
            'name' => slugify($data['name']),
            'display_name' => $data['display_name'] ?? $data['name'],
            'user_id' => Auth::id(),
        ]);

        return new TagResource($tag);
    }

    /**
     * Update a tag.
     *
     * @operationId updateTag
     */
    #[BlockedOnDemoSite]
    public function update(int $id, Request $request)
    {
        $tag = Tag::findOrFail($id);

        Gate::authorize('update', $tag);

        $data = $request->validate([
            'name' => [
                'string',
                'max:100',
                Rule::unique('tags', 'name')->ignore($id),
            ],
            'display_name' => 'nullable|string|max:100',
        ]);

        if (!empty($data['name'])) {
            $data['name'] = slugify($data['name']);
        }

        $tag->fill($data)->save();

        return new TagResource($tag);
    }

    /**
     * Delete tags.
     *
     * @operationId deleteTags
     */
    #[BlockedOnDemoSite]
    public function bulkDelete(Request $request)
    {
        $data = $request->validate([
            // Comma-separated list of tag IDs to delete. Maximum of 100 IDs. Non-existing IDs will be ignored.
            'ids' => 'required|string',
        ]);

        $tagIds = array_slice(explode(',', $data['ids']), 0, 100);

        Gate::authorize('destroy', [Tag::class, $tagIds]);

        Tag::query()->whereIn('id', $tagIds)->delete();
        DB::table('taggables')->whereIn('tag_id', $tagIds)->delete();

        return response()->noContent();
    }
}
