<?php

namespace App\Http\Resources;

use App\Models\Artist;
use App\Models\Genre;
use App\Models\ProfileImage;
use App\Models\ProfileLink;
use App\Models\Track;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin Artist
 */
#[SchemaName('Artist')]
class ArtistResource extends JsonResource
{
    public function __construct(
        $resource,
        protected string|null $fieldsPreset = null,
    ) {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $isCompact = $this->fieldsPreset === 'artist';

        return [
            'id' => $this->id,
            'name' => $this->name,
            'image_small' => $this->image_small,
            'verified' => (bool) $this->verified,
            'model_type' => Artist::MODEL_TYPE,

            'spotify_id' => $this->when(!$isCompact, $this->spotify_id),
            'deezer_id' => $this->when(!$isCompact, $this->deezer_id),
            'updated_at' => $this->when(!$isCompact, $this->updated_at),
            'created_at' => $this->when(!$isCompact, $this->created_at),
            'disabled' => $this->when(!$isCompact, (bool) $this->disabled),
            'views' => $this->when(!$isCompact, $this->views),
            'plays' => $this->when(!$isCompact, $this->plays),

            'genres' => $this->whenLoaded(
                'genres',
                fn(Collection $genres) => $genres->map(
                    fn(Genre $genre) => [
                        'id' => $genre->id,
                        'name' => $genre->name,
                        'display_name' => $genre->display_name,
                    ],
                ),
            ),
            'top_tracks' => $this->whenLoaded(
                'topTracks',
                fn(Collection $tracks) => $tracks->map(
                    fn(Track $track) => $track->toArray(),
                ),
            ),
            'similar' => $this->whenLoaded(
                'similar',
                fn(Collection $similar) => $similar->map(
                    fn(Artist $artist) => (new static($artist))->resolve(),
                ),
            ),
            'profile' => $this->whenLoaded(
                'profile',
                fn() => [
                    'city' => $this->profile?->city,
                    'country' => $this->profile?->country,
                    'description' => $this->profile?->description,
                ],
            ),
            'profile_images' => $this->whenLoaded(
                'profileImages',
                fn(Collection $images) => $images->map(
                    fn(ProfileImage $image) => [
                        'url' => $image->url,
                        'id' => $image->id,
                    ],
                ),
            ),
            'links' => $this->whenLoaded(
                'links',
                fn(Collection $links) => $links->map(
                    fn(ProfileLink $link) => [
                        'url' => $link->url,
                        'title' => $link->title,
                    ],
                ),
            ),

            'likes_count' => $this->whenCounted('likes'),
            'albums_count' => $this->whenCounted('albums'),
            'followers_count' => $this->whenCounted('followers'),
        ];
    }
}
