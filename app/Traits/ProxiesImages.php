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