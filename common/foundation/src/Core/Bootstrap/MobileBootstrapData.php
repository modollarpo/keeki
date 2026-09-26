<?php

namespace Common\Core\Bootstrap;

use App\Models\User;
use Common\Localizations\Localization;
use Common\Users\Resources\UserResource;
use Illuminate\Support\Str;

class MobileBootstrapData extends BaseBootstrapData
{
    public function init(): self
    {
        $cssThemes = $this->getThemes();
        $themes = [
            'light' => $cssThemes
                ->where('default_light', true)
                ->first()
                ->toArray(),
            'dark' => $cssThemes
                ->where('default_dark', true)
                ->first()
                ->toArray(),
        ];

        $themes['light']['values'] = $this->transformValuesForFlutter(
            $themes['light']['values'],
        );
        $themes['dark']['values'] = $this->transformValuesForFlutter(
            $themes['dark']['values'],
        );

        $this->data = [
            'themes' => $themes,
            'user' => $this->getCurrentUser(),
            'menus' => $this->getMobileMenus(),
            'settings' => [
                'social.google.enable' => (bool) settings(
                    'social.google.enable',
                ),
                'require_email_confirmation' => (bool) settings(
                    'require_email_confirmation',
                ),
                'registration.disable' => (bool) settings(
                    'registration.disable',
                ),
            ],
            'locales' => Localization::get(),
        ];

        if (settings('i18n.enable')) {
            $langCode = request('activeLocale') ?: app()->getLocale();
            foreach ($this->data['locales'] as $locale) {
                if ($locale->language === $langCode) {
                    $locale->loadLines();
                    break;
                }
            }
        }

        if ($this->data['user']) {
            $this->data['user']->createOrTouchSession();
        }

        return $this;
    }

    public function refreshToken(string $deviceName): self
    {
        $user = $this->data['user'];
        if ($user) {
            $user['access_token'] = $user->refreshApiToken($deviceName);
            $this->loadFcmToken($user);
        }
        return $this;
    }

    public function getCurrentUser(): ?UserResource
    {
        if ($user = request()->user()) {
            return $this->loadFcmToken($user);
        }
        return null;
    }

    private function getMobileMenus(): array
    {
        return array_values(
            array_filter(
                settings('menus'),
                fn($menu) => collect($menu['positions'])->some(
                    fn($position) => Str::startsWith($position, 'mobile-app'),
                ),
            ),
        );
    }

    private function transformValuesForFlutter(array $colors): array
    {
        $radiusValues = [
            '--be-button-radius',
            '--be-input-radius',
            '--be-panel-radius',
            '--be-radius',
        ];

        $valuesToSkip = [];

        return collect($colors)
            ->map(function ($value, $name) use ($valuesToSkip, $radiusValues) {
                if (in_array($name, $radiusValues)) {
                    if (str_ends_with($value, 'rem')) {
                        return (float) str_replace('rem', '', $value) * 16;
                    } else {
                        return (float) str_replace('px', '', $value);
                    }
                } elseif (in_array($name, $valuesToSkip)) {
                    return $value;
                } elseif (str_ends_with($value, '%')) {
                    return (int) str_replace('%', '', $value);
                } elseif (str_starts_with($value, 'oklch(')) {
                    return $this->oklchToRgba($value) ?? $value;
                } else {
                    return $value;
                }
            })
            ->toArray();
    }

    /**
     * Convert CSS oklch() to Flutter-friendly [r, g, b, a] (0–255 RGB, 0–1 alpha).
     * Supports: oklch(L C H), oklch(L% C H), oklch(L C H / A), oklch(L C H / A%).
     */
    private function oklchToRgba(string $oklch): ?array
    {
        if (
            !preg_match(
                '/^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i',
                trim($oklch),
                $matches,
            )
        ) {
            return null;
        }

        $L = $this->parseCssNumber($matches[1], percentIsFraction: true);
        $C = (float) $matches[2];
        $H = (float) $matches[3];
        $alpha =
            isset($matches[4]) && $matches[4] !== ''
                ? $this->parseCssNumber($matches[4], percentIsFraction: true)
                : 1.0;

        // OKLCH → OKLab
        $hRad = deg2rad($H);
        $a = $C * cos($hRad);
        $b = $C * sin($hRad);

        // OKLab → linear sRGB (Björn Ottosson)
        $l_ = $L + 0.3963377774 * $a + 0.2153788864 * $b;
        $m_ = $L - 0.1055613458 * $a - 0.0638541728 * $b;
        $s_ = $L - 0.0894841775 * $a - 1.291485548 * $b;

        $l = $l_ * $l_ * $l_;
        $m = $m_ * $m_ * $m_;
        $s = $s_ * $s_ * $s_;

        $rLin = 4.0767416621 * $l - 3.3077115913 * $m + 0.2309699292 * $s;
        $gLin = -1.2684380046 * $l + 2.6097574011 * $m - 0.3413193965 * $s;
        $bLin = -0.0041960863 * $l - 0.7034186147 * $m + 1.707614701 * $s;

        return [
            (int) round($this->linearToSrgb($rLin) * 255),
            (int) round($this->linearToSrgb($gLin) * 255),
            (int) round($this->linearToSrgb($bLin) * 255),
            round($alpha, 4),
        ];
    }

    private function parseCssNumber(
        string $value,
        bool $percentIsFraction = false,
    ): float {
        if (str_ends_with($value, '%')) {
            $n = (float) substr($value, 0, -1);
            return $percentIsFraction ? $n / 100 : $n;
        }

        return (float) $value;
    }

    private function linearToSrgb(float $c): float
    {
        $c = max(0.0, min(1.0, $c));

        if ($c <= 0.0031308) {
            return 12.92 * $c;
        }

        return 1.055 * pow($c, 1 / 2.4) - 0.055;
    }

    private function loadFcmToken(User $user): User
    {
        if (method_exists($user, 'loadFcmToken')) {
            $user->loadFcmToken();
        }
        return $user;
    }
}
