<?php namespace App\Services\Search;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Channel;
use App\Models\Genre;
use App\Models\Playlist;
use App\Models\Tag;
use App\Models\Track;
use App\Models\User;
use App\Services\Albums\AlbumLoader;
use App\Services\Artists\ArtistLoader;
use App\Services\Playlists\PlaylistLoader;
use App\Services\Providers\MusicMetadataProvider;
use App\Services\Tracks\TrackLoader;
use App\Services\Users\UserProfileLoader;
use Common\Database\Datasource\Datasource;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;

class MainSearch
{
    protected MusicMetadataProvider $metadata;
    protected array $externalResults = [];
    protected string $query;
    protected int $perPage;
    protected int $page;

    public function __construct()
    {
        $this->metadata = new MusicMetadataProvider();
    }

    public function execute(
        string $q,
        int $page,
        int $perPage = 10,
        array $modelTypes,
    ): Collection {
        $this->query = urldecode($q);
        $this->perPage = $perPage;
        $this->page = $page;

        $results = collect();

        $externalTypes = array_intersect($modelTypes, [
            Artist::MODEL_TYPE,
            Album::MODEL_TYPE,
            Track::MODEL_TYPE,
        ]);

        if (
            in_array(settings('search_provider'), [
                'external',
                'local_and_external',
            ]) &&
            !empty($externalTypes)
        ) {
            $this->externalResults = $this->metadata->search(
                $this->query,
                $this->page,
                $this->perPage,
                $externalTypes,
            );
        }

        foreach ($modelTypes as $modelType) {
            if ($modelType === Artist::MODEL_TYPE) {
                $results['artists'] = $this->artists();
            } elseif ($modelType === Album::MODEL_TYPE) {
                $results['albums'] = $this->albums();
            } elseif ($modelType === Track::MODEL_TYPE) {
                $results['tracks'] = $this->tracks();
            } elseif ($modelType === Playlist::MODEL_TYPE) {
                $results['playlists'] = $this->playlists();
            } elseif ($modelType === Channel::MODEL_TYPE) {
                $results['channels'] = $this->channels();
            } elseif ($modelType === Genre::MODEL_TYPE) {
                $results['genres'] = $this->genres();
            } elseif ($modelType === Tag::MODEL_TYPE) {
                $results['tags'] = $this->tags();
            } elseif ($modelType === User::MODEL_TYPE) {
                $results['users'] = $this->users();
            }
        }

        // sort data['results'], by key, tracks first, then albums, then artists, playlists, users
        return $results->sortBy(
            fn($value, $key) => array_search($key, [
                'tracks',
                'artists',
                'albums',
                'playlists',
                'users',
            ]),
        );
    }

    protected function artists(): array
    {
        $pagination = $this->externalProviderBackedSearch('artists');
        $pagination['data'] = array_values(
            array_filter(
                $pagination['data'],
                fn($artist) => !$artist['disabled'],
            ),
        );
        return $pagination;
    }

    protected function searchArtistsLocally(): AbstractPaginator
    {
        $datasource = new Datasource(
            Artist::query(),
            [
                'query' => $this->query,
                'perPage' => $this->perPage,
                'page' => $this->page,
                'paginate' => 'simple',
                'filters' => [
                    [
                        'key' => 'disabled',
                        'operator' => '=',
                        'value' => false,
                    ],
                ],
            ],
            filtererName: config('scout.driver'),
        );
        return $datasource
            ->paginate()
            ->through(
                fn($artist) => (new ArtistLoader())->toApiResource($artist),
            );
    }

    protected function albums(): array
    {
        $pagination = $this->externalProviderBackedSearch('albums');
        $pagination['data'] = array_values(
            array_filter(
                $pagination['data'],
                fn($album) => !array_find(
                    $album['artists'],
                    fn($artist) => $artist['disabled'],
                ),
            ),
        );
        return $pagination;
    }

    protected function searchAlbumsLocally(): AbstractPaginator
    {
        $datasource = new Datasource(
            Album::query(),
            [
                'query' => $this->query,
                'perPage' => $this->perPage,
                'page' => $this->page,
                'paginate' => 'simple',
                'filters' => [
                    [
                        'key' => 'release_date',
                        'operator' => '<=',
                        'value' => now(),
                    ],
                ],
            ],
            filtererName: config('scout.driver'),
        );
        return $datasource
            ->paginate()
            ->through(
                fn($album) => (new AlbumLoader())->toApiResource(
                    $album->load(['artists']),
                ),
            );
    }

    protected function tracks(): array
    {
        $pagination = $this->externalProviderBackedSearch('tracks');
        $pagination['data'] = array_values(
            array_filter(
                $pagination['data'],
                fn($track) => !array_find(
                    $track['artists'],
                    fn($artist) => $artist['disabled'],
                ),
            ),
        );
        return $pagination;
    }

    protected function searchTracksLocally(): AbstractPaginator
    {
        $datasource = new Datasource(
            Track::query(),
            [
                'query' => $this->query,
                'perPage' => $this->perPage,
                'page' => $this->page,
                'paginate' => 'simple',
            ],
            filtererName: config('scout.driver'),
        );
        return $datasource
            ->paginate()
            ->through(
                fn($track) => (new TrackLoader())->toApiResource(
                    $track->load(['album.artists', 'artists', 'uploadedSrc']),
                ),
            );
    }

    protected function playlists(): array
    {
        return Playlist::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn($playlist) => (new PlaylistLoader())->toApiResource(
                    $playlist->load(['editors']),
                ),
            )
            ->toArray();
    }

    protected function channels(): array
    {
        return Channel::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn(Channel $channel) => $channel->toApiResource($channel),
            )
            ->toArray();
    }

    protected function genres(): array
    {
        return Genre::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->toArray();
    }

    protected function tags(): array
    {
        return Tag::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->toArray();
    }

    protected function users(): array
    {
        return User::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn($user) => (new UserProfileLoader())->toApiResource(
                    $user->loadCount('followers')->load(['subscriptions']),
                ),
            )
            ->toArray();
    }

    protected function externalProviderBackedSearch(string $resultsType): array
    {
        if (settings('search_provider') === 'external') {
            if (!isset($this->externalResults[$resultsType])) {
                return (new Paginator([], 0, $this->perPage))->toArray();
            }

            return $this->externalResults[$resultsType]->toArray();
        }

        $localResults = match ($resultsType) {
            'artists' => $this->searchArtistsLocally(),
            'albums' => $this->searchAlbumsLocally(),
            'tracks' => $this->searchTracksLocally(),
            default => throw new \Exception('Invalid model type'),
        };

        if (
            settings('search_provider') === 'local_and_external' &&
            isset($this->externalResults[$resultsType])
        ) {
            $mergedItems = $this->externalResults[$resultsType]->items();

            foreach ($localResults as $localItem) {
                if (
                    !array_find(
                        $mergedItems,
                        fn($externalItem) => $externalItem['id'] ===
                            $localItem['id'],
                    )
                ) {
                    $mergedItems[] = $localItem;
                }
            }

            return [
                ...$this->externalResults[$resultsType]->toArray(),
                'data' => $mergedItems,
            ];
        }

        return $localResults->toArray();
    }
}
