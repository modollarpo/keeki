<?php

/**
 * Keekii default theme tokens — "Ember & Ink".
 *
 * See docs/design-direction.md for the rationale behind each choice.
 *
 * Two things worth knowing before editing:
 *
 * 1. THESE ARE NOT THE PRODUCTION SOURCE OF TRUTH. The rendered theme comes from
 *    the `css_themes` table (see Common\Settings\Themes\CssTheme and
 *    BaseBootstrapData), and CssThemesTableSeeder only inserts a theme when one
 *    is missing -- it never updates an existing row. ops/sync-settings.php pushes
 *    these values into the default light/dark rows on every deploy, which is what
 *    makes edits here actually take effect.
 *
 * 2. RADIUS TOKEN NAMES ARE ORDER-SENSITIVE AND EASY TO GET WRONG. The
 *    stylesheet reads --be-radius-button / --be-radius-input / --be-radius-card
 *    / --be-radius-card-sm / --be-radius-card-xs (common-tailwind.css), NOT the
 *    --be-button-radius / --be-input-radius / --be-panel-radius spelling used
 *    previously -- those names were read by nothing and were inert. The
 *    .radius-* classes on <html> override these again, so the signature is also
 *    pinned in resources/client/keekii-brand.css.
 */

return [
    'light' => [
        // Warm paper rather than pure white, and near-black warmed toward the
        // primary's hue. The chroma is the point: it makes the surface feel lit.
        '--be-background' => 'oklch(0.992 0.005 85)',
        '--be-foreground' => 'oklch(0.223 0.021 55)',

        '--be-card' => 'oklch(1 0 0)',
        '--be-card-foreground' => 'oklch(0.223 0.021 55)',

        '--be-popover' => 'oklch(1 0 0)',
        '--be-popover-foreground' => 'oklch(0.223 0.021 55)',

        // Ember. Deliberately off the vendor's green.
        '--be-primary' => 'oklch(0.652 0.183 41)',
        '--be-primary-foreground' => 'oklch(0.995 0.004 85)',

        // Violet counterweight for night/club contexts.
        '--be-accent' => 'oklch(0.58 0.19 292)',
        '--be-accent-foreground' => 'oklch(0.995 0.004 85)',

        '--be-secondary' => 'oklch(0.961 0.011 80)',
        '--be-secondary-foreground' => 'oklch(0.28 0.026 55)',

        '--be-muted' => 'oklch(0.963 0.008 82)',
        '--be-muted-foreground' => 'oklch(0.512 0.017 60)',

        '--be-destructive' => 'oklch(0.577 0.222 27.3)',

        '--be-border' => 'oklch(0.902 0.012 78)',
        '--be-input' => 'oklch(0.902 0.012 78)',
        '--be-ring' => 'oklch(0.652 0.183 41)',

        // Soft rectangles, not pills. See docs/design-direction.md §2.
        '--be-radius' => '0.875rem',
        '--be-radius-button' => '0.75rem',
        '--be-radius-input' => '0.625rem',
        '--be-radius-card' => '1.25rem',
        '--be-radius-card-sm' => '0.875rem',
        '--be-radius-card-xs' => '0.5rem',
        // Legacy vendor spellings, kept only so anything still reading them
        // inherits the same signature.
        '--be-button-radius' => '0.75rem',
        '--be-input-radius' => '0.625rem',
        '--be-panel-radius' => '1.25rem',

        // Sidebar is its own plane, darker than the content surface, with its
        // own primary and hairline. Not a copy of the surface tokens.
        '--be-sidebar' => 'oklch(0.955 0.014 80)',
        '--be-sidebar-foreground' => 'oklch(0.243 0.022 55)',
        '--be-sidebar-primary' => 'oklch(0.652 0.183 41)',
        '--be-sidebar-primary-foreground' => 'oklch(0.995 0.004 85)',
        '--be-sidebar-accent' => 'oklch(0.916 0.022 78)',
        '--be-sidebar-accent-foreground' => 'oklch(0.223 0.021 55)',
        '--be-sidebar-border' => 'oklch(0.886 0.016 78)',
        '--be-sidebar-ring' => 'oklch(0.652 0.183 41)',
    ],

    'dark' => [
        // Deep ink-plum instead of the vendor's near-black.
        '--be-background' => 'oklch(0.168 0.021 292)',
        '--be-foreground' => 'oklch(0.972 0.008 85)',

        '--be-card' => 'oklch(0.223 0.024 292)',
        '--be-card-foreground' => 'oklch(0.972 0.008 85)',

        '--be-popover' => 'oklch(0.245 0.025 292)',
        '--be-popover-foreground' => 'oklch(0.972 0.008 85)',

        // Lightened and slightly de-saturated rather than reused verbatim, so
        // it stays legible on ink without glowing.
        '--be-primary' => 'oklch(0.712 0.164 44)',
        '--be-primary-foreground' => 'oklch(0.18 0.021 292)',

        '--be-accent' => 'oklch(0.68 0.16 294)',
        '--be-accent-foreground' => 'oklch(0.18 0.021 292)',

        '--be-secondary' => 'oklch(0.283 0.024 292)',
        '--be-secondary-foreground' => 'oklch(0.972 0.008 85)',

        '--be-muted' => 'oklch(0.273 0.022 292)',
        '--be-muted-foreground' => 'oklch(0.752 0.016 85)',

        '--be-destructive' => 'oklch(0.665 0.191 22.2)',

        '--be-border' => 'oklch(1 0 0 / 11%)',
        '--be-input' => 'oklch(1 0 0 / 15%)',
        '--be-ring' => 'oklch(0.712 0.164 44)',

        '--be-radius' => '0.875rem',
        '--be-radius-button' => '0.75rem',
        '--be-radius-input' => '0.625rem',
        '--be-radius-card' => '1.25rem',
        '--be-radius-card-sm' => '0.875rem',
        '--be-radius-card-xs' => '0.5rem',
        '--be-button-radius' => '0.75rem',
        '--be-input-radius' => '0.625rem',
        '--be-panel-radius' => '1.25rem',

        // Darker still than the content surface, so the nav recedes.
        '--be-sidebar' => 'oklch(0.131 0.021 292)',
        '--be-sidebar-foreground' => 'oklch(0.945 0.01 85)',
        '--be-sidebar-primary' => 'oklch(0.712 0.164 44)',
        '--be-sidebar-primary-foreground' => 'oklch(0.18 0.021 292)',
        '--be-sidebar-accent' => 'oklch(0.253 0.026 292)',
        '--be-sidebar-accent-foreground' => 'oklch(0.972 0.008 85)',
        '--be-sidebar-border' => 'oklch(1 0 0 / 8%)',
        '--be-sidebar-ring' => 'oklch(0.712 0.164 44)',
    ],
];
