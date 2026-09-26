<?php

namespace Common\Comments\Controllers;

use Common\Comments\Comment;
use Common\Comments\CommentToApiResource;
use Common\Comments\CrupdateComment;
use Common\Comments\CrupdateCommentRequest;
use Common\Core\Demo\BlockedOnDemoSite;
use Common\Database\Datasource\Datasource;
use Common\Database\QueryBuilder\FiltersList;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

/**
 * @tags Comments
 */
class CommentController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->get('userId');
        Gate::authorize('index', [Comment::class, $userId]);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'deleted' => 'string',
            'reports' => 'string',
            'user_id' => 'string',
            'created_at' => 'nullable',
            'created_at.*' => 'string',
            'updated_at' => 'nullable',
            'updated_at.*' => 'string',
            'commentable_id' => 'nullable',
            'commentable_type' => 'nullable|string',
        ]);

        $builder = Comment::query()->with(['user']);

        // will need to specify this outside of filters on edit title comments page
        if (
            $request->get('commentable_id') &&
            $request->get('commentable_type')
        ) {
            $commentable = app(
                modelTypeToNamespace($request->get('commentable_type')),
            )->findOrFail($request->get('commentable_id'));
            $builder->forCommentable($commentable);
        } else {
            $builder->where('commentable_id', '>', 0);
        }

        $data['with'] = 'commentable';
        $data['withCount'] = 'reports';
        $data['filters'] = (new FiltersList(
            Comment::filterableFields(),
            $data,
        ))->toArray();

        $dataSource = new Datasource($builder, $data);

        $pagination = $dataSource->paginate();

        $pagination->through(function (Comment $comment) use ($request) {
            return (new CommentToApiResource())->execute(
                $comment,
                $request->get('loader'),
            );
        });

        return response()->json(['pagination' => $pagination]);
    }

    public function show(Comment $comment)
    {
        Gate::authorize('show', $comment);

        return response()->json(['comment' => $comment]);
    }

    public function store(CrupdateCommentRequest $request)
    {
        Gate::authorize('store', Comment::class);

        $comment = app(CrupdateComment::class)->execute($request->all());

        return response()->json(['comment' => $comment]);
    }

    #[BlockedOnDemoSite]
    public function update(Comment $comment, CrupdateCommentRequest $request)
    {
        Gate::authorize('store', $comment);

        $comment = app(CrupdateComment::class)->execute(
            $request->all(),
            $comment,
        );

        return response()->json(['comment' => $comment]);
    }

    #[BlockedOnDemoSite]
    public function destroy(string $ids)
    {
        $commentIds = explode(',', $ids);
        Gate::authorize('destroy', [Comment::class, $commentIds]);

        $allDeleted = [];
        $allMarkedAsDeleted = [];

        Comment::query()
            ->whereIn('id', $commentIds)
            ->chunkById(100, function (Collection $comments) use (
                &$allDeleted,
                &$allMarkedAsDeleted,
            ) {
                $toMarkAsDeleted = [];
                $toDelete = [];
                foreach ($comments as $comment) {
                    if ($comment->allChildren()->count() > 1) {
                        $toMarkAsDeleted[] = $comment->id;
                    } else {
                        $toDelete[] = $comment->id;
                    }
                }
                if (!empty($toMarkAsDeleted)) {
                    Comment::query()
                        ->whereIn('id', $toMarkAsDeleted)
                        ->update(['deleted' => true]);
                }
                if (!empty($toDelete)) {
                    Comment::query()->whereIn('id', $toDelete)->delete();
                }
                $allDeleted = array_merge($allDeleted, $toDelete);
                $allMarkedAsDeleted = array_merge(
                    $allMarkedAsDeleted,
                    $toMarkAsDeleted,
                );
            });

        return response()->json([
            'allDeleted' => $allDeleted,
            'allMarkedAsDeleted' => $allMarkedAsDeleted,
        ]);
    }

    public function restore(Request $request)
    {
        Gate::authorize('update', Comment::class);

        $commentIds = $request->get('commentIds');

        Comment::query()
            ->whereIn('id', $commentIds)
            ->update(['deleted' => false]);

        return response()->json();
    }
}
