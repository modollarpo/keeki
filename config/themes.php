<?php

/**
 * Keekii default theme tokens — "Monochrome Ember".
 *
 * See docs/design-direction.md for the rationale behind each choice.
 *
 * Three things worth knowing before editing:
 *
 * 1. THESE ARE NOT THE PRODUCTION SOURCE OF TRUTH. The rendered theme comes from
 *    the `css_themes` table (see Common\Settings\Themes\CssTheme and
 *    BaseBootstrapData), and CssThemesTableSeeder only inserts a theme when one
 *    is missing -- it never updates an existing row. ops/sync-settings.php pushes
 *    these values into the default light/dark rows on every deploy, which is what
 *    makes edits here actually take effect.
 *
 * 2. EVERY VALUE BELOW IS CONTRAST-AUDITED, NOT HAND-PICKED. Each token is
 *    derived from the brand hue and then walked in OKLCH lightness until it
 *    clears its WCAG 2.2 AA target against every surface it actually lands on:
 *    4.5:1 for text pairs, 3:1 for control boundaries (WCAG 1.4.11). The
 *    derivation is reproducible and its audit is the gate; re-run it rather than
 *    eyeballing a value. Notable consequences already baked in:
 *      - --be-primary-foreground is paper, not ink. Near-black #1e150e on the
 *        ember only measures 4.2:1, so the light-theme button label is warm
 *        paper on ember instead.
 *      - --be-muted-foreground is solved against --be-muted, not --be-background,
 *        because muted is the closer of the two surfaces in light mode.
 *      - --be-input is a deliberate 3:1 grey (#99948e light, #6b6057 dark) rather
 *        than a subtle hairline. Input borders are the only thing identifying
 *        the control, so 1.4.11 applies to them.
 *
 * 3. RADIUS TOKEN NAMES ARE ORDER-SENSITIVE AND EASY TO GET WRONG. The
 *    stylesheet reads --be-radius-button / --be-radius-input / --be-radius-card
 *    / --be-radius-card-sm / --be-radius-card-xs (common-tailwind.css), NOT the
 *    --be-button-radius / --be-input-radius / --be-panel-radius spelling used
 *    previously -- those names were read by nothing and were inert. The
 *    .radius-* classes on <html> override these again, so the signature is also
 *    pinned in resources/client/keekii-brand.css.
 *
 * ONE DELIBERATE DEVIATION FROM THE APPROVED PALETTE
 *
 * The approved light ember is #d84b00. It measures 4.16:1 on the light
 * background #fefcf9: comfortably fine for fills, borders, icons, and text at
 * 24px or larger, but short of the 4.5:1 required for normal-size link text.
 * Rather than ship a token that silently fails one job, light --be-primary is
 * stepped to #cf4700 — the minimum move that clears 4.5:1, a delta of 0.020 in
 * OKLCH lightness, which is not visually distinguishable. #d84b00 remains the
 * brand reference for the mark and wordmark, where it is a large graphic rather
 * than body text. Dark --be-primary is unaffected.
 *
 * --be-destructive-foreground is deliberately absent: nothing in the CSS or
 * TypeScript reads it, so defining it would be a token that looks load-bearing
 * and silently is not. The vendor's other side-specific tokens (--be-sidebar-
 * foreground / -primary / -accent / -border / -ring) are kept below for the
 * same reason they were kept before this rewrite: they round out the sidebar
 * plane if the vendor ever wires them. Today only --be-sidebar itself is
 * actually consumed. A verifier run over the repo reports which are live, so
 * this is documented rather than assumed.
 */

return [
    'light' => [
        // Warm paper rather than pure white, and near-black warmed toward the
        // primary's hue. The chroma is the point: it makes the surface feel lit.
        '--be-background' => 'oklch(0.992 0.005 78)',
        '--be-foreground' => 'oklch(0.205 0.02 59)',

        '--be-card' => 'oklch(1 0 0)',
        '--be-card-foreground' => 'oklch(0.205 0.02 59)',

        '--be-popover' => 'oklch(1 0 0)',
        '--be-popover-foreground' => 'oklch(0.205 0.02 59)',

        // Ember. Deliberately off the vendor's green. See the deviation note
        // above for why this is #cf4700 rather than the approved #d84b00.
        '--be-primary' => 'oklch(0.582 0.183 40)',
        '--be-primary-foreground' => 'oklch(0.992 0.005 78)',

        // Monochrome means monochrome: the accent is a deeper, redder step of
        // the same ember hue, not the violet counterweight this theme used to
        // carry. It carries hover/active emphasis and small highlights.
        '--be-accent' => 'oklch(0.5 0.139 40)',
        '--be-accent-foreground' => 'oklch(0.992 0.005 78)',

        '--be-secondary' => 'oklch(0.966 0.012 80)',
        '--be-secondary-foreground' => 'oklch(0.205 0.02 59)',

        '--be-muted' => 'oklch(0.956 0.009 85)',
        '--be-muted-foreground' => 'oklch(0.537 0.017 81)',

        '--be-destructive' => 'oklch(0.501 0.178 29)',

        '--be-border' => 'oklch(0.906 0.011 77)',
        // 3:1 against --be-card, not a decorative hairline.
        '--be-input' => 'oklch(0.669 0.011 73)',
        '--be-ring' => 'oklch(0.582 0.183 40)',

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

        // Sidebar is its own plane, darker than the content surface. Only
        // --be-sidebar is consumed today; the rest round out the plane.
        '--be-sidebar' => 'oklch(0.951 0.015 81)',
        '--be-sidebar-foreground' => 'oklch(0.205 0.02 59)',
        '--be-sidebar-primary' => 'oklch(0.582 0.183 40)',
        '--be-sidebar-primary-foreground' => 'oklch(0.992 0.005 78)',
        '--be-sidebar-accent' => 'oklch(0.924 0.013 75)',
        '--be-sidebar-accent-foreground' => 'oklch(0.205 0.02 59)',
        '--be-sidebar-border' => 'oklch(0.881 0.011 77)',
        '--be-sidebar-ring' => 'oklch(0.582 0.183 40)',
    ],

    'dark' => [
        // Deep ember-brown ink instead of the vendor's near-black, and with the
        // violet removed the surface reads warm at every level.
        '--be-background' => 'oklch(0.159 0.012 61)',
        '--be-foreground' => 'oklch(0.968 0.007 81)',

        '--be-card' => 'oklch(0.191 0.011 61)',
        '--be-card-foreground' => 'oklch(0.968 0.007 81)',

        '--be-popover' => 'oklch(0.209 0.013 67)',
        '--be-popover-foreground' => 'oklch(0.968 0.007 81)',

        // Lightened and slightly de-saturated rather than reused verbatim, so
        // it stays legible on ink without glowing. Needs no lightness step: it
        // already clears 4.5:1 as link text.
        '--be-primary' => 'oklch(0.739 0.161 48)',
        '--be-primary-foreground' => 'oklch(0.159 0.012 61)',

        '--be-accent' => 'oklch(0.6 0.129 45)',
        '--be-accent-foreground' => 'oklch(0.159 0.012 61)',

        '--be-secondary' => 'oklch(0.23 0.012 67)',
        '--be-secondary-foreground' => 'oklch(0.968 0.007 81)',

        '--be-muted' => 'oklch(0.218 0.012 67)',
        '--be-muted-foreground' => 'oklch(0.606 0.014 56)',

        '--be-destructive' => 'oklch(0.734 0.135 26)',

        '--be-border' => 'oklch(1 0 0 / 11%)',
        // 3:1 against --be-card, matching the light theme's intent.
        '--be-input' => 'oklch(0.497 0.02 62)',
        '--be-ring' => 'oklch(0.739 0.161 48)',

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
        '--be-sidebar' => 'oklch(0.139 0.011 65)',
        '--be-sidebar-foreground' => 'oklch(0.968 0.007 81)',
        '--be-sidebar-primary' => 'oklch(0.739 0.161 48)',
        '--be-sidebar-primary-foreground' => 'oklch(0.159 0.012 61)',
        '--be-sidebar-accent' => 'oklch(0.21 0.012 56)',
        '--be-sidebar-accent-foreground' => 'oklch(0.968 0.007 81)',
        '--be-sidebar-border' => 'oklch(1 0 0 / 8%)',
        '--be-sidebar-ring' => 'oklch(0.739 0.161 48)',
    ],
];
