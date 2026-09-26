<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class YoutubeBlockedVideo extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'code' => 'integer',
        'blocked_count' => 'integer',
    ];
}