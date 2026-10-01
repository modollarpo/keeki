<?php

namespace App\Traits;

trait ProxiesImages
{
    /**
     * Rewrite outbound image URLs through the local /api/v1/img-proxy route,
     * which caches a copy locally and serves it (fast, CDN-friendly). Off by
     * default; enabled with the `img_proxy.enabled` setting.
     */
    protected function proxiedImage(?string $value): ?string
    {
        if (
            !$value ||
            !settings('img_proxy.enabled', false) ||
            str_starts_with($value, '/') ||
            str_starts_with($value, 'data:') ||
            str_starts_with($value, 'blob:')
        ) {
            return $value;
        }

        // Only a *remote* URL should be proxied. The proxy exists to pull a
        // remote image in and cache it; handing it a local path produces
        // /api/v1/img-proxy?url=storage/... which the controller rejects as an
        // invalid url (422), so the image never rendered.
        //
        // A local path is already served by this app. Anchor it to the site root
        // so it cannot resolve against whatever page the browser is on -
        // on /playlist/5/foo a bare "storage/..." would look for
        // "/playlist/5/storage/...".
        if (! preg_match('#^https?://#i', $value)) {
            return '/'.ltrim($value, '/');
        }

        $base = rtrim((string) config('app.url'), '/');
        if (str_starts_with($value, $base)) {
            return $value;
        }

        return $base.'/api/v1/img-proxy?url='.rawurlencode($value);
    }

    public function getImageAttribute(?string $value): ?string
    {
        return $this->proxiedImage($value);
    }

    public function getImageSmallAttribute(?string $value): ?string
    {
        return $this->proxiedImage($value);
    }
}