<?php namespace App\Models;

use App\Traits\OrdersByPopularity;
use App\Traits\ProxiesImages;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class Genre extends Tag
{
    use OrdersByPopularity, ProxiesImages;

    const MODEL_TYPE = 'genre';
    protected $table = 'genres';
    protected $guarded = [];
    protected $appends = ['model_type'];

    public function artists(): MorphToMany
    {
        return $this->morphedByMany(Artist::class, 'genreable');
    }

    public function tracks(): MorphToMany
    {
        return $this->morphedByMany(Track::class, 'genreable');
    }

    public function albums(): MorphToMany
    {
        return $this->morphedByMany(Album::class, 'genreable');
    }

    public function insertOrRetrieve(array|Collection $tags): Collection
    {
        if (!($tags instanceof Collection)) {
            $tags = collect($tags);
        }

        // genre table has no "type" or "user_id" column
        $tags = $tags->filter()->map(function ($genre) {
            if (is_string($genre)) {
                return [
                    'name' => $genre,
                    'display_name' => $genre,
                ];
            }

            return [
                'name' => $genre['name'],
                'display_name' => Arr::get(
                    $genre,
                    'display_name',
                    $genre['name'],
                ),
            ];
        });

        $tags->transform(function (array $genre) {
            $genre['name'] = slugify($genre['name']);
            return $genre;
        });

        $existing = $this->getByNames($tags->pluck('name'));

        $new = $tags->filter(function ($genre) use ($existing) {
            return !$existing->first(function ($existingGenre) use ($genre) {
                return slugify($existingGenre['name']) ===
                    slugify($genre['name']);
            });
        });

        if ($new->isNotEmpty()) {
            $new->transform(function ($genre) {
                $genre['created_at'] = now();
                $genre['updated_at'] = now();
                return $genre;
            });
            $this->insert($new->toArray());
            return $this->getByNames($tags->pluck('name'));
        }

        return $existing;
    }

    public function getByNames(Collection $names): Collection
    {
        return $this->query()->whereIn('name', $names)->get();
    }

    public function toNormalizedArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->display_name ?: $this->name,
            'image' => $this->image,
            'model_type' => self::MODEL_TYPE,
        ];
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $this->display_name,
        ];
    }

    public static function filterableFields(): array
    {
        return ['id', 'created_at', 'updated_at'];
    }

    public static function sortableFields(): array
    {
        return [
            'id',
            'name',
            'display_name',
            'artists_count',
            'popularity',
            'created_at',
            'updated_at',
        ];
    }

    public static function getModelTypeAttribute(): string
    {
        return Genre::MODEL_TYPE;
    }
}
