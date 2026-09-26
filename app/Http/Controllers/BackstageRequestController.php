<?php

namespace App\Http\Controllers;

use App\Http\Requests\CrupdateBackstageRequestRequest;
use App\Models\BackstageRequest;
use App\Notifications\BackstageRequestWasHandled;
use App\Services\Backstage\ApproveBackstageRequest;
use App\Services\Backstage\CrupdateBackstageRequest;
use Common\Core\Demo\BlockedOnDemoSite;
use Common\Database\Datasource\Datasource;
use Common\Database\QueryBuilder\FiltersList;
use Common\Files\FileEntry;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

class BackstageRequestController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->get('userId');
        Gate::authorize('index', [BackstageRequest::class, $userId]);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'userId' => 'nullable',
            'type' => 'string',
            'status' => 'string',
            'user_id' => 'string',
            'created_at' => 'nullable',
            'created_at.*' => 'string',
            'updated_at' => 'nullable',
            'updated_at.*' => 'string',
        ]);

        // map new filters format from frontend to the old Datasource format
        $data['filters'] = (new FiltersList(
            BackstageRequest::filterableFields(),
            $data,
        ))->toArray();

        $builder = BackstageRequest::with(['user', 'artist']);

        $paginator = new Datasource($builder, $data);

        // default: pending first, then approved, then denied
        if (!isset($data['sort'])) {
            $paginator->order = false;
            $builder->orderByRaw(
                "FIELD(status, 'pending', 'approved', 'denied') ASC",
            );
        }

        $pagination = $paginator->paginate();

        return response()->json(['pagination' => $pagination]);
    }

    public function show(BackstageRequest $backstageRequest)
    {
        Gate::authorize('show', $backstageRequest);

        $backstageRequest->load(['user.social_profiles', 'artist']);

        $request = $backstageRequest->toArray();

        if (isset($request['data']['passport_scan_id'])) {
            $request['data']['passport_scan_entry'] = FileEntry::find(
                $request['data']['passport_scan_id'],
            );
        }

        return response()->json(['request' => $request]);
    }

    public function store(CrupdateBackstageRequestRequest $request)
    {
        Gate::authorize('store', BackstageRequest::class);

        $backstageRequest = app(CrupdateBackstageRequest::class)->execute(
            $request->all(),
        );

        return response()->json(['request' => $backstageRequest]);
    }

    public function update(
        BackstageRequest $backstageRequest,
        CrupdateBackstageRequestRequest $request,
    ) {
        Gate::authorize('store', $backstageRequest);

        $backstageRequest = app(CrupdateBackstageRequest::class)->execute(
            $request->all(),
            $backstageRequest,
        );

        return response()->json(['request' => $backstageRequest]);
    }

    #[BlockedOnDemoSite]
    public function destroy(string $ids)
    {
        $backstageRequestIds = explode(',', $ids);
        Gate::authorize('store', [
            BackstageRequest::class,
            $backstageRequestIds,
        ]);

        BackstageRequest::whereIn('id', $backstageRequestIds)->delete();

        return response()->noContent();
    }

    #[BlockedOnDemoSite]
    public function approve(BackstageRequest $backstageRequest, Request $request)
    {
        Gate::authorize('approve', $backstageRequest);

        $backstageRequest = app(ApproveBackstageRequest::class)->execute(
            $backstageRequest,
            $request->all(),
        );

        return response()->json(['request' => $backstageRequest]);
    }

    #[BlockedOnDemoSite]
    public function deny(BackstageRequest $backstageRequest, Request $request)
    {
        Gate::authorize('approve', $backstageRequest);

        $backstageRequest->fill(['status' => 'denied'])->save();

        $backstageRequest->user->notify(
            new BackstageRequestWasHandled(
                $backstageRequest,
                $request->get('notes'),
            ),
        );

        return response()->json(['request' => $backstageRequest]);
    }
}
