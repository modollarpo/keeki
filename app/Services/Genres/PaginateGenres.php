<?php

namespace App\Services\Genres;

use App\Models\Genre;
use Common\Database\Datasource\Datasource;
use Illuminate\Pagination\AbstractPaginator;

class PaginateGenres
{
    public function asApiResponse(
        array $params,
        $builder = null,
        string|null $loader = null,
    ): array {
        $paginator = $this->asPaginator($params, $builder);

        return [
            ...$paginator->toArray(),
            'data' => array_map(
                fn(Genre $genre) => (new GenreToApiResource())->execute(
                    $genre,
                    $loader,
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
            $builder = Genre::query();
        }

        $datasource = new Datasource($builder, $params);

        return $datasource->paginate();
    }
}
