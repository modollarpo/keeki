<?php

namespace App\Models;

use Common\Core\BaseModel;
use Laravel\Scout\Searchable;
use Illuminate\Support\Collection;
use Illuminate\Support\Arr;

class Tag extends BaseModel
{
    use Searchable;

    const MODEL_TYPE = 'tag';

    protected $guarded = [];

    public function tracks()
    {
        return $this->morphedByMany(Track::class, 'taggable');
    }

    public function albums()
    {
        return $this->morphedByMany(Album::class, 'taggable');
    }

    public function insertOrRetrieve(array|Collection $tags): Collection
    {
        if (!($tags instanceof Collection)) {
            $tags = collect($tags);
        }

        $tags = $tags->filter()->map(function ($tag) {
            if (is_string($tag)) {
                return [
                    'name' => $tag,
                    'display_name' => $tag,
                ];
            }

            return [
                'name' => $tag['name'],
                'display_name' => Arr::get($tag, 'display_name', $tag['name']),
            ];
        });

        $tags->transform(function (array $tag) {
            $tag['name'] = slugify($tag['name']);
            return $tag;
        });

        $existing = $this->getByNames($tags->pluck('name'));

        $new = $tags->filter(function ($tag) use ($existing) {
            return !$existing->first(function ($existingTag) use ($tag) {
                return slugify($existingTag['name']) === slugify($tag['name']);
            });
        });

        if ($new->isNotEmpty()) {
            $new->transform(function ($tag) {
                $tag['created_at'] = now();
                $tag['updated_at'] = now();
                return $tag;
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
            'name' => $this->name,
            'model_type' => static::MODEL_TYPE,
        ];
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'created_at' => $this->created_at->timestamp ?? '_null',
            'updated_at' => $this->updated_at->timestamp ?? '_null',
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
            'created_at',
            'updated_at',
            'tracks_count',
            'albums_count',
        ];
    }

    public static function getModelTypeAttribute(): string
    {
        return static::MODEL_TYPE;
    }
}
