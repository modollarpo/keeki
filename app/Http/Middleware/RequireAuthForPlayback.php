<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Owns the single definition of "may this visitor play anything", so the route
 * guard and the response serializer below can never drift apart.
 *
 * The player already refuses to start playback for guests in the browser (see
 * resources/client/web-player/auth/playback-auth-gate-store.ts), but the API
 * itself stayed open, so anything able to make an HTTP request could ask for a
 * stream URL directly. Enforcing it here means the hand-off is refused on the
 * server as well.
 *
 * It is intentionally narrow. Browsing, searching and building queues stay open
 * to guests, which is the behaviour the setting promises in the admin UI, so it
 * is applied per-route rather than to the whole api group.
 *
 * What this cannot do: playback is delivered by third parties. The default
 * source is a YouTube iframe, so the audio travels from Google straight to the
 * browser, and Audius, Jamendo and live radio are played from the providers'
 * own CDN URLs. This application never proxies those bytes, so it cannot gate
 * them beyond declining to resolve them. Anyone determined can still play a
 * video id they already know. Treat the setting as a registration nudge, not
 * as DRM.
 */
class RequireAuthForPlayback
{
    /**
     * Whether a guest must be turned away from playback entirely.
     */
    public static function blocks(?Authenticatable $user): bool
    {
        return (bool) settings('player.require_auth', false) && $user === null;
    }

    /**
     * Refuses the endpoints that hand out a directly playable media source.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (self::blocks($request->user())) {
            // A plain 401 rather than a redirect: these are XHR calls whose
            // callers already treat a failed response as "no source here".
            return response()->json([
                'error' => 'authentication_required',
                'message' => 'You need to be signed in to play this.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
