<?php

namespace App\Services\Playlists;

use Illuminate\Support\Facades\File;

/**
 * Draws a cover image for an editorial playlist.
 *
 * Country playlists are built by a command, not by a person in the admin, so
 * they never get artwork the way a hand-made playlist would. The result was a
 * wall of blank tiles in the playlists section.
 *
 * There is real cover art nowhere in the chain to reuse: most imported tracks
 * carry no image at all, and the handful of local "storage/artwork/..." entries
 * that did get written point at a directory that does not exist. So these are
 * generated - deterministic from the playlist name, which means re-running the
 * sync produces byte-identical art and does not churn the files.
 */
class PlaylistCoverFactory
{
    private const SIZE = 600;

    public function __construct(
        private readonly string $fontRegular = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        private readonly string $fontBold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    ) {
    }

    /**
     * Ensure a cover exists for the given playlist and return the value to
     * store in the playlist's `image` column, or null when it cannot be drawn.
     */
    public function ensure(string $code, string $title, string $subtitle = ''): ?string
    {
        if (! extension_loaded('gd')) {
            return null;
        }

        $relative = sprintf('storage/playlists/%s/%s.png', strtolower($code), $this->slug($title));
        $absolute = public_path($relative);

        if (! File::exists($absolute)) {
            File::ensureDirectoryExists(dirname($absolute));

            if (! $this->draw($absolute, $code, $title, $subtitle)) {
                return null;
            }
        }

        return $relative;
    }

    /**
     * Draws a square cover: a two-tone gradient, a few soft shapes seeded from
     * the playlist name so each one differs, then the title and market.
     */
    private function draw(string $path, string $code, string $title, string $subtitle): bool
    {
        $image = imagecreatetruecolor(self::SIZE, self::SIZE);

        if ($image === false) {
            return false;
        }

        $hash = $this->seed($code.'|'.$title);

        [$from, $to] = $this->palette($hash);

        imagealphablending($image, true);

        $this->gradient($image, $from, $to);

        $shapes = imagecolorallocatealpha($image, 255, 255, 255, 108);
        for ($i = 0; $i < 4; $i++) {
            $x = ($hash >> ($i * 5)) % self::SIZE;
            $y = ($hash >> ($i * 5 + 3)) % self::SIZE;
            $r = 60 + (($hash >> ($i * 3)) % 180);
            imagefilledellipse($image, $x, $y, $r, $r, $shapes);
        }

        $ink = imagecolorallocate($image, 255, 255, 255);

        if ($this->fontBold !== '' && is_file($this->fontBold)) {
            $this->text($image, $this->fontBold, 46, 90, 96, $title, $ink);
        }

        if ($subtitle !== '' && $this->fontRegular !== '' && is_file($this->fontRegular)) {
            $this->text($image, $this->fontRegular, 26, 90, self::SIZE - 90, $subtitle, $ink);
        }

        $ok = imagepng($image, $path, 6);
        imagedestroy($image);

        return $ok;
    }

    /**
     * A vertical gradient. GD has no native gradient, so it is drawn by hand
     * one scanline at a time.
     *
     * @param  array{0: int, 1: int, 2: int}  $from
     * @param  array{0: int, 1: int, 2: int}  $to
     */
    private function gradient(\GdImage $image, array $from, array $to): void
    {
        for ($y = 0; $y < self::SIZE; $y++) {
            $t = $y / max(1, self::SIZE - 1);
            $r = (int) round($from[0] + ($to[0] - $from[0]) * $t);
            $g = (int) round($from[1] + ($to[1] - $from[1]) * $t);
            $b = (int) round($from[2] + ($to[2] - $from[2]) * $t);

            imageline($image, 0, $y, self::SIZE, $y, imagecolorallocate($image, $r, $g, $b));
        }
    }

    /**
     * @param  int  $ink  a GD colour index, as returned by imagecolorallocate()
     */
    private function text(\GdImage $image, string $font, int $size, int $x, int $y, string $value, int $ink): void
    {
        $lines = $this->wrap($value, $font, $size, self::SIZE - ($x * 2));

        foreach ($lines as $i => $line) {
            imagettftext($image, $size, 0, $x, $y + ($i * (int) ($size * 1.32)), $ink, $font, $line);
        }
    }

    /**
     * @return array<int, string>
     */
    private function wrap(string $value, string $font, int $size, int $maxWidth): array
    {
        $words = preg_split('/\s+/', trim($value)) ?: [];
        $lines = [];
        $line = '';

        foreach ($words as $word) {
            $candidate = $line === '' ? $word : $line.' '.$word;

            if ($this->width($font, $size, $candidate) <= $maxWidth) {
                $line = $candidate;

                continue;
            }

            if ($line !== '') {
                $lines[] = $line;
            }

            // a single word too long for the line (a very long name) still has
            // to be broken somewhere rather than run off the canvas
            $line = mb_strlen($word) > 24 ? mb_substr($word, 0, 24) : $word;
        }

        if ($line !== '') {
            $lines[] = $line;
        }

        return $lines === [] ? [''] : $lines;
    }

    private function width(string $font, int $size, string $value): int
    {
        $box = imagettfbbox($size, 0, $font, $value);

        return is_array($box) ? abs($box[2] - $box[0]) : 0;
    }

    /**
     * @return array{0: array{0: int, 1: int, 2: int}, 1: array{0: int, 1: int, 2: int}}
     */
    private function palette(int $hash): array
    {
        $hue = $hash % 360;
        $hue2 = ($hue + 40 + (($hash >> 8) % 60)) % 360;

        return [$this->fromHsv($hue, 0.72, 0.62), $this->fromHsv($hue2, 0.68, 0.34)];
    }

    /**
     * @return array{0: int, 1: int, 2: int}
     */
    private function fromHsv(int $hue, float $saturation, float $value): array
    {
        $c = $value * $saturation;
        $x = $c * (1 - abs(fmod($hue / 60.0, 2.0) - 1));
        $m = $value - $c;

        [$r, $g, $b] = match (true) {
            $hue < 60 => [$c, $x, 0.0],
            $hue < 120 => [$x, $c, 0.0],
            $hue < 180 => [0.0, $c, $x],
            $hue < 240 => [0.0, $x, $c],
            $hue < 300 => [$x, 0.0, $c],
            default => [$c, 0.0, $x],
        };

        return [
            (int) round(($r + $m) * 255),
            (int) round(($g + $m) * 255),
            (int) round(($b + $m) * 255),
        ];
    }

    private function seed(string $value): int
    {
        return (int) (hexdec(substr(md5($value), 0, 8)) & 0x7fffffff);
    }

    private function slug(string $value): string
    {
        $slug = preg_replace('/[^a-z0-9]+/i', '-', $value) ?: '';
        $slug = strtolower(trim($slug, '-'));

        return $slug !== '' ? $slug : 'playlist';
    }
}