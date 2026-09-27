<?php

namespace App\Models;

use Common\Core\BaseModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Spotlight extends BaseModel
{
    use HasFactory;

    const MODEL_TYPE = 'spotlight';

    protected $table = 'spotlights';

    protected $guarded = ['id'];

    protected $casts = [
        'id' => 'integer',
        'artist_id' => 'integer',
        'active' => 'boolean',
        'position' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function artist(): BelongsTo
    {
        return $this->belongsTo(Artist::class);
    }

    public static function scopeActive($query)
    {
        return $query
            ->where('active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public static function filterableFields(): array
    {
        return ['id', 'active', 'artist_id', 'position', 'created_at', 'updated_at'];
    }

    public static function sortableFields(): array
    {
        return ['id', 'position', 'active', 'created_at', 'updated_at'];
    }

    public function toNormalizedArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->title ?? $this->artist?->name,
            'image' => $this->image,
            'description' => $this->blurb,
            'model_type' => self::MODEL_TYPE,
        ];
    }

    public static function getModelTypeAttribute(): string
    {
        return self::MODEL_TYPE;
    }
}