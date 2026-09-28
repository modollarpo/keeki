<?php namespace App\Services\Homepage;

use App\Models\Channel;
use Common\Auth\Models\UserSession;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Resolves the homepage channel for the current visitor's country.
 *
 * Why server-side: the client resolves the homepage from `settings.homepage`
 * (see resources/client/web-player/channels/homepage-channel-page.tsx), and
 * that value ships inside the bootstrap data, which is built fresh per request
 * and never cached. Overriding it here means the whole country split happens
 * before any HTML or JSON is emitted, with zero client-side work and no
 * redirect, and crawlers still get a normal 200 on "/".
 *
 * Deliberately conservative:
 *  - disabled unless `homepage.geo_countries` is a non-empty map, so enabling
 *    it is an explicit admin action;
 *  - only applies when the homepage is a channel (not a custom page), because
 *    a custom page has no country equivalent;
 *  - the resolved channel must exist and be a public `channel` type, so a
 *    stale or hidden id in the map can never render a broken or private
 *    homepage;
 *  - any failure returns null and leaves the default homepage untouched.
 */
class ResolveGeoHomepage
{
    /**
     * @return int|null the channel id to use, or null to keep the default
     */
    public function execute(): ?int
    {
        $default = settings('homepage.value');
        $defaultType = settings('homepage.type');

        // Only channel homepages can be swapped per country. Matched with
        // startsWith rather than ===, because the codebase also accepts the
        // legacy plural 'channels' value (see ChannelPresets, DeleteChannels).
        if (!is_string($defaultType) || !Str::startsWith($defaultType, 'channel') || !$default) {
            return null;
        }

        $map = $this->countryChannelMap();

        if (!$map) {
            return null;
        }

        $isoCode = $this->resolveIsoCode();

        if (!$isoCode) {
            return null;
        }

        $channelId = $map[$isoCode] ?? null;

        // an explicit "no channel for this country" entry is not a way to
        // blank the homepage, it just means "use the default"
        if ($channelId === null || (int) $channelId === (int) $default) {
            return null;
        }

        $channel = Channel::query()
            ->where('id', (int) $channelId)
            ->where('type', 'channel')
            ->where('public', true)
            ->first();

        if (!$channel) {
            Log::warning(
                'homepage.geo_countries points at a channel that does not exist',
                [
                    'iso_code' => $isoCode,
                    'channel_id' => $channelId,
                ],
            );

            return null;
        }

        return (int) $channel->id;
    }

    /**
     * Parse the admin-provided ISO2 => channel id map.
     *
     * Accepts a JSON object string, because that is what a settings field
     * stores. Keys are normalised to uppercase so admins are not tripped up by
     * "ng" vs "NG".
     *
     * @return array<string, int> empty when unset or unparseable
     */
    private function countryChannelMap(): array
    {
        $raw = settings('homepage.geo_countries');

        if (is_array($raw)) {
            $decoded = $raw;
        } elseif (is_string($raw) && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
        } else {
            return [];
        }

        if (!is_array($decoded)) {
            Log::warning('homepage.geo_countries is not valid JSON, ignoring');

            return [];
        }

        $map = [];

        foreach ($decoded as $country => $channelId) {
            if (!is_string($country) || !is_numeric($channelId)) {
                continue;
            }

            $map[strtoupper(trim($country))] = (int) $channelId;
        }

        return $map;
    }

    /**
     * Best-effort ISO2 for the visitor.
     *
     * For signed-in users the country stored on their session wins over a live
     * IP lookup: it is stable while they travel or use a VPN, which is what you
     * want for content personalisation. Stored lowercase, so uppercase it.
     */
    private function resolveIsoCode(): ?string
    {
        $user = auth()->user();

        if ($user) {
            $session = UserSession::query()
                ->where('user_id', $user->id)
                ->latest()
                ->first();

            $stored = $session?->country;

            if (is_string($stored) && trim($stored) !== '') {
                return strtoupper(trim($stored));
            }
        }

        $isoCode = geoip(getIp())['iso_code'] ?? null;

        return is_string($isoCode) && $isoCode !== ''
            ? strtoupper($isoCode)
            : null;
    }
}
