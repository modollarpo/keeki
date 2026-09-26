<?php

namespace App\Services\Artists;

use App\Models\Artist;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class GetSimilarArtists
{
    public function execute(Artist $artist, array $params = []): Collection
    {
        $genreIds = $artist->genres->pluck('id');

        if ($genreIds->isNotEmpty()) {
            return $this->getByGenres($genreIds, $artist->id, $params);
        }

        return collect();
    }

    private function getByGenres(
        Collection $genreIds,
        $artistId,
        $params,
    ): Collection {
        $limit = max((int) (Arr::get($params, 'limit') ?? 20), 1);

        $subquery = DB::table('genreables')
            ->select('genreable_id', DB::raw('count(*) as tag_count'))
            ->whereIn('genre_id', $genreIds)
            ->where('genreable_type', Artist::MODEL_TYPE)
            ->where('genreable_id', '!=', $artistId)
            ->groupBy('genreable_id')
            ->orderBy('tag_count', 'desc')
            ->limit($limit);

        return Artist::joinSub($subquery, 'top_artists', function ($join) {
            $join->on('artists.id', '=', 'top_artists.genreable_id');
        })
            ->orderBy('top_artists.tag_count', 'desc')
            ->select('artists.*', 'top_artists.tag_count')
            ->limit($limit)
            ->get();
    }
}
