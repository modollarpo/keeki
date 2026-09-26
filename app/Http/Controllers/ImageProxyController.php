<?php

namespace App\Http\Controllers;

use Common\Core\BaseController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ImageProxyController extends BaseController
{
    // Domains considered safe to proxy (album/artist art CDNs).
    private const ALLOWED_HOSTS = [
        '*.dzcdn.net',
        '*.spotifycdn.com',
        '*.wzcdn.net',
        'i.scdn.co',
        'mosaic.scdn.co',
        'seed-mix-image.spotifycdn.com',
        'lh3.googleusercontent.com',
        'images.unsplash.com',
    ];

    public function show(Request $request): Response
    {
        $url = $request->query('url');
        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            abort(422, 'A valid url parameter is required.');
        }

        $parsed = parse_url($url);
        $host = strtolower($parsed['host'] ?? '');
        $allowed = false;
        foreach (self::ALLOWED_HOSTS as $pattern) {
            if (
                $pattern === $host ||
                (str_contains($pattern, '*') &&
                    fnmatch($pattern, $host))
            ) {
                $allowed = true;
                break;
            }
        }
        if (!$allowed) {
            abort(403, 'Image host is not allowed.');
        }

        $key = sha1($url);
        $disk = Storage::disk('local');
        $cacheDir = 'img-proxy';
        $extension = (string) pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION);
        if ($extension && preg_match('/^[a-z0-9]{2,5}$/i', $extension)) {
            $extension = strtolower($extension);
        } else {
            $extension = 'jpg';
        }

        $cachePath = "$cacheDir/$key.$extension";
        if ($disk->exists($cachePath)) {
            return $this->serve(
                $disk->get($cachePath),
                $this->contentType($extension),
            );
        }

        try {
            $response = Http::timeout(10)
                ->withOptions(['verify' => false])
                ->get($url);
        } catch (\Exception $e) {
            abort(502, 'Could not fetch remote image.');
        }
        if (!$response->successful()) {
            abort(502, 'Remote image returned '.$response->status().'.');
        }

        $body = $response->body();
        if (empty($body)) {
            abort(502, 'Remote image is empty.');
        }

        $contentType = $response->header('Content-Type');
        $extension = match (true) {
            str_contains($contentType, 'image/png') => 'png',
            str_contains($contentType, 'image/webp') => 'webp',
            str_contains($contentType, 'image/gif') => 'gif',
            str_contains($contentType, 'image/avif') => 'avif',
            str_contains($contentType, 'image/jpeg') => 'jpg',
            default => $extension,
        };
        $cachePath = "$cacheDir/$key.$extension";

        $disk->put($cachePath, $body);
        return $this->serve($body, $this->contentType($extension));
    }

    private function contentType(string $extension): string
    {
        return match ($extension) {
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'avif' => 'image/avif',
            default => 'image/jpeg',
        };
    }

    private function serve(string $body, string $contentType): Response
    {
        return response($body, 200, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}