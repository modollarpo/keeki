<?php

namespace App\Resources;

use App\Models\Tag;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Tag
 */
#[SchemaName('Tag')]
class TagResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'type' => $this->type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'model_type' => Tag::MODEL_TYPE,
            'tracks_count' => $this->whenCounted('tracks'),
            'albums_count' => $this->whenCounted('albums'),
        ];
    }
}
