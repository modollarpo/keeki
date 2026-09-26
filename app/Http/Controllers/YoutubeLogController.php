<?php

namespace App\Http\Controllers;

use App\Models\YoutubeBlockedVideo;
use Carbon\Carbon;
use Common\Core\BaseController;
use File;
use Request;

class YoutubeLogController extends BaseController
{
    public function store()
    {
        $code = Request::get('code');
        $videoUrl = (string) Request::get('videoUrl');
        $region = strtoupper(substr((string) Request::get('region'), 0, 8)) ?: 'XX';
        $date = Carbon::now()->format('y:m:d h:i:s');
        File::append(storage_path('logs/youtube-client.log'), "[$date] [$region] Could not play '$videoUrl' because of '$code' error.\n");

        if (!preg_match('/^[\w-]{11}$/', $videoUrl)) {
            return $this->success();
        }

        $row = YoutubeBlockedVideo::where('video_id', $videoUrl)
            ->where('region', $region)
            ->first();

        if ($row) {
            $row->increment('blocked_count');
            $row->update(['code' => $code, 'last_seen' => Carbon::now()]);
        } else {
            YoutubeBlockedVideo::create([
                'video_id' => $videoUrl,
                'region' => $region,
                'code' => $code,
                'blocked_count' => 1,
                'first_seen' => Carbon::now(),
                'last_seen' => Carbon::now(),
            ]);
        }

        return $this->success();
    }
}
