<?php

namespace Database\Seeders;

use App\Models\Channel;
use Illuminate\Database\Seeder;

class DetailChannelsSeeder extends Seeder
{
    public function run()
    {
        $channels = [
            'album' => [
                'name' => '{{channel.restriction.name}}',
                'config' => [
                    'contentType' => 'listAll',
                    'contentModel' => 'track',
                    'restriction' => 'album',
                    'restrictionModelId' => 'urlParam',
                    'lockSlug' => true,
                    'layout' => 'trackTable',
                    'nestedLayout' => 'grid',
                    'contentOrder' => 'number:asc',
                ],
            ],
            'artist' => [
                'name' => '{{channel.restriction.name}}',
                'config' => [
                    'contentType' => 'listAll',
                    'contentModel' => 'track',
                    'restriction' => 'artist',
                    'restrictionModelId' => 'urlParam',
                    'lockSlug' => true,
                    'layout' => 'trackTable',
                    'nestedLayout' => 'grid',
                    'contentOrder' => 'popularity:desc',
                ],
            ],
            'playlist' => [
                'name' => '{{channel.restriction.name}}',
                'config' => [
                    'contentType' => 'listAll',
                    'contentModel' => 'track',
                    'restriction' => 'playlist',
                    'restrictionModelId' => 'urlParam',
                    'lockSlug' => true,
                    'layout' => 'trackTable',
                    'nestedLayout' => 'grid',
                    'contentOrder' => 'order:asc',
                ],
            ],
        ];

        foreach ($channels as $slug => $data) {
            Channel::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $data['name'],
                    'type' => 'channel',
                    'internal' => true,
                    'public' => true,
                    'config' => $data['config'],
                ],
            );
        }
    }
}