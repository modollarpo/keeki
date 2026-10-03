<?php

namespace App\Http\Controllers;

use App\Models\Track;
use App\Models\TrackPlay;
use App\Services\Providers\MusicMetadataProvider;
use App\Services\Tracks\TrackLoader;
use Carbon\Carbon;
use Common\Core\BaseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

/**
 * Provides personalized content rows for channels with contentType "personalized".
 *
 * GET /api/personalized/recently-played  — last 20 distinct tracks the
 *     authenticated user played, ordered by most recent play. Falls back to
 *     popular tracks for guests or users with no history.
 *
 * GET /api/personalized/made-for-you     — radio recommendations seeded
 *     from the user's most-played track in the last 30 days. Falls back to
 *     popular tracks when there is no history.
 *
 * Both endpoints are cached per-user so they add no meaningful load to
 * the homepage on every page view.
 */
class PersonalizedChannelController extends BaseController
{
    private const RECENTLY_PLAYED_TTL_MINUTES = 15;
    private const MADE_FOR_YOU_TTL_MINUTES    = 60;

    /** Relations required by TrackLoader::toApiResource() */
    private const TRACK_RELATIONS = ['album', 'album.artists', 'artists'];

    // -------------------------------------------------------------------------
    // Recently played
    // -------------------------------------------------------------------------

    public function recentlyPlayed()
    {
        $userId = Auth::id();

        if (!$userId) {
            return $this->popularFallback();
        }

        $cacheKey = "personalized.recently_played.{$userId}";

        $tracks = Cache::remember(
            $cacheKey,
            Carbon::now()->addMinutes(self::RECENTLY_PLAYED_TTL_MINUTES),
            fn () => $this->buildRecentlyPlayed($userId),
        );

        return $this->success(['tracks' => $tracks, 'is_personalized' => true]);
    }

    private function buildRecentlyPlayed(int $userId): array
    {
        $trackIds = TrackPlay::query()
            ->where('user_id', $userId)
            ->where('created_at', '>=', Carbon::now()->subDays(90))
            ->orderBy('created_at', 'desc')
            ->get(['track_id'])
            ->unique('track_id')
            ->take(20)
            ->pluck('track_id');

        if ($trackIds->isEmpty()) {
            // No history yet — show popular tracks so the row is never blank
            return $this->popularTracks();
        }

        $loader = new TrackLoader();

        return Track::with(self::TRACK_RELATIONS)
            ->whereIn('id', $trackIds)
            ->get()
            ->sortBy(fn ($t) => $trackIds->search($t->id))
            ->values()
            ->map(fn ($track) => $loader->toApiResource($track))
            ->all();
    }

    // -------------------------------------------------------------------------
    // Made for you
    // -------------------------------------------------------------------------

    public function madeForYou()
    {
        $userId = Auth::id();

        if (!$userId) {
            return $this->popularFallback();
        }

        $cacheKey = "personalized.made_for_you.{$userId}";

        $tracks = Cache::remember(
            $cacheKey,
            Carbon::now()->addMinutes(self::MADE_FOR_YOU_TTL_MINUTES),
            fn () => $this->buildMadeForYou($userId),
        );

        return $this->success(['tracks' => $tracks, 'is_personalized' => true]);
    }

    private function buildMadeForYou(int $userId): array
    {
        // Seed from the user's most-played track in the last 30 days.
        $seedTrackId = TrackPlay::query()
            ->where('user_id', $userId)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('track_id, COUNT(*) as play_count')
            ->groupBy('track_id')
            ->orderByDesc('play_count')
            ->value('track_id');

        if (!$seedTrackId) {
            // No listening history — show popular tracks so the row is never blank
            return $this->popularTracks();
        }

        $seedTrack = Track::with(self::TRACK_RELATIONS)->find($seedTrackId);
        if (!$seedTrack) {
            return [];
        }

        $loader = new TrackLoader();

        // Cache recommendations per-seed-track (2 days, same as RadioController)
        $recommendations = Cache::remember(
            "radio.track.{$seedTrackId}",
            Carbon::now()->addDays(2),
            fn () => (new MusicMetadataProvider())
                ->getRecommendations($seedTrack),
        );

        if ($recommendations->isEmpty()) {
            return [];
        }

        // Re-hydrate with all required relations so toApiResource() works
        $ids = $recommendations->pluck('id')->filter()->values();

        return Track::with(self::TRACK_RELATIONS)
            ->whereIn('id', $ids)
            ->get()
            ->sortBy(fn ($t) => $ids->search($t->id))
            ->values()
            ->map(fn (Track $t) => $loader->toApiResource($t))
            ->all();
    }

    // -------------------------------------------------------------------------
    // Fallback: popular tracks for guests / new users with no history
    // -------------------------------------------------------------------------

    private function popularFallback()
    {
        return $this->success(['tracks' => $this->popularTracks(), 'is_personalized' => false]);
    }

    /**
     * Returns the top 20 tracks by external_popularity, cached 6 hours.
     * Used as fallback for guests and for authenticated users with no history.
     */
    private function popularTracks(): array
    {
        return Cache::remember(
            'personalized.popular_fallback',
            Carbon::now()->addHours(6),
            function () {
                $loader = new TrackLoader();
                return Track::with(self::TRACK_RELATIONS)
                    // external_popularity was renamed from spotify_popularity in
                    // the 2026_03_02 migration — works for Deezer-backed data too.
                    ->orderByDesc('external_popularity')
                    ->take(20)
                    ->get()
                    ->map(fn ($t) => $loader->toApiResource($t))
                    ->all();
            },
        );
    }
}
