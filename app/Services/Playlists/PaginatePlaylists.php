<?php

namespace App\Services\Playlists;

use App\Models\Playlist;
use Common\Database\Datasource\Datasource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Str;

class PaginatePlaylists
{
    public function asApiResponse(
        array $params,
        Builder|Relation|null $builder = null,
        string|null $loader = null,
    ): array {
        $paginator = $this->asPaginator($params, $builder);

        return [
            ...$paginator->toArray(),
            'data' => array_map(
                fn(Playlist $playlist) => (new PlaylistLoader())->toApiResource(
                    $playlist,
                    $loader,
                ),
                $paginator->items(),
            ),
        ];
    }

    public function asPaginator(
        array $params,
        Builder|Relation|null $builder = null,
    ): AbstractPaginator {
        $builder = $builder ?? Playlist::query();

        $builder->with(['editors']);

        $datasource = new Datasource($builder, $params);
        $order = $datasource->getOrder();

        if (Str::endsWith($order['col'], 'popularity')) {
            $datasource->order = false;
            $builder->orderByPopularity($order['dir']);
        }

        return $datasource->paginate();
    }
}
