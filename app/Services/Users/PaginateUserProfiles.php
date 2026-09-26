<?php

namespace App\Services\Users;

use App\Models\User;
use Common\Database\Datasource\Datasource;
use Illuminate\Pagination\AbstractPaginator;

class PaginateUserProfiles
{
    public function asApiResponse(array $params, $builder = null): array
    {
        $paginator = $this->asPaginator($params, $builder);

        return [
            ...$paginator->toArray(),
            'data' => array_map(
                fn(User $user) => (new UserProfileLoader())->toApiResource(
                    $user,
                ),
                $paginator->items(),
            ),
        ];
    }

    public function asPaginator(
        array $params,
        $builder = null,
    ): AbstractPaginator {
        if (!$builder) {
            $builder = User::query();
        }

        $builder->withCount(['followers'])->with(['subscriptions']);

        $datasource = new Datasource($builder, $params);

        return $datasource->paginate();
    }
}
