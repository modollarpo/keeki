# Keekii — design direction

Status: proposed, and implemented where noted. Token work is **done**; homepage
restructure and micro-detail work is **planned** (see the roadmap at the bottom).

## The problem with the current look

The vendor shell (`common/foundation`, package `bedrive-react`) ships a coherent
but entirely generic identity. Concretely, on `music.keekii.net` today:

- Primary is a warm orange (`oklch(56.751% 0.15772 46.257)`) that was set ad-hoc
  in the admin, not designed — and it clashes with nothing because nothing else
  has an opinion either.
- Every neutral is **pure grey**: `oklch(0.2478 0 0)`, `oklch(0.985 0 0)`. Zero
  chroma. This is the single biggest "template" tell.
- Radii resolve to button `1.5rem` / card `1.5rem` — i.e. **everything is a pill**.
  That is the default look of every music app ever.
- No display face. The whole product is set in one sans, so brand moments have
  no voice.
- `@fontsource-variable/inter` is installed in `package.json` but **never
  imported anywhere** — dead dependency.

## 1. Palette — "Monochrome Ember"

> **Status: signed off — Option A, implemented.** The three no-violet candidates
> were in `docs/palette-preview.html`; **A** was chosen, so the violet accent is
> gone and `--be-accent` is now a deeper, redder step of the same ember hue
> rather than a second hue. The tokens below are live in `config/themes.php`.
>
> Every value is **derived, not hand-picked**: the audit walks each token in OKLCH
> lightness until it clears its WCAG 2.2 AA target against every surface it
> actually lands on (4.5:1 for text, 3:1 for control boundaries). Re-run the
> derivation rather than eyeballing a value.
>
> That audit settled the open question the preview left hanging. The preview
> flagged the light ember as the binding constraint at 4.0–4.3, which is below
> 4.5:1 — dark mode was comfortable and light mode was the real decision. The
> consequence is that on light surfaces the saturated ember **cannot carry
> normal-size link text**, and it also means the button label is paper, not ink:
> near-black `#1e150e` on the ember only measures 4.2:1, so
> `--be-primary-foreground` is warm paper on ember.
>
> One deliberate deviation from the approved hex: light `--be-primary` is
> `oklch(0.582 0.183 40)` ≈ `#cf4700` rather than the approved `#d84b00`, which
> measures 4.16:1 on the light background. The shift is 0.020 in OKLCH
> lightness — not visually distinguishable — and it makes the token safe for text
> in both themes. `#d84b00` remains the brand reference for the mark and
> wordmark, where it is a large graphic meeting the 3:1 non-text bar, not body
> text.

Warm, lit-from-within, like a record sleeve under a lamp. The organising idea is
**chroma in the neutrals**: greys are warmed toward the primary's hue so the
whole surface feels lit rather than switched off. This is the change that
separates the product at a glance more than any single accent.

| Token | Keekii light | Keekii dark | Intent |
|---|---|---|---|
| `--be-primary` | `oklch(0.582 0.183 40)` | `oklch(0.739 0.161 48)` | Ember. Vivid, warm, high energy |
| `--be-accent` | `oklch(0.5 0.139 40)` | `oklch(0.6 0.129 45)` | A deeper ember. Same hue, not a second one |
| `--be-background` | `oklch(0.992 0.005 78)` | `oklch(0.159 0.012 61)` | Warm paper / deep ember-brown ink |
| `--be-foreground` | `oklch(0.205 0.02 59)` | `oklch(0.968 0.007 81)` | Warm near-black / warm white |

Notes:
- The dark background is **ember-brown, not black and not plum**. Pure
  `oklch(0.0969 0 0)` is the vendor default and reads as an unfinished dev
  build; the plum that preceded this revision was dropped with the violet.
- Chroma stays low in the neutrals — enough to feel warm, low enough that text
  contrast and long-list legibility are unaffected.
- `--be-primary` is dark-mode *lightened and slightly de-saturated* rather than
  reused verbatim, so it stays legible on ink without glowing. Dark needs no
  lightness step: it already clears 4.5:1 as link text.
- `--be-muted-foreground` is solved against `--be-muted`, not `--be-background`,
  because muted is the closer of the two surfaces in light mode.
- `--be-input` is a deliberate 3:1 grey (`#99948e` light, `#6b6057` dark) rather
  than a subtle hairline: an input border is often the only thing identifying
  the control, so WCAG 1.4.11 applies to it.
- Only `--be-sidebar` is actually consumed today. The rest of the vendor's
  side-specific tokens are retained so the sidebar plane is defined if they are
  ever wired, rather than being deleted on an assumption.

### Sidebar gets its own treatment

The vendor reuses `--be-sidebar-*` as near-copies of the surface tokens. Keekii
instead makes the sidebar a **distinct, darker plane** than the content area, in
both themes, with its own hairline and its own primary. This gives the app
depth without a single shadow, and makes the nav read as chrome rather than
content.

## 2. Radius — deliberately *less* round

Pills are the template default. Keekii's signature is soft rectangles:

| | vendor (live today) | Keekii |
|---|---|---|
| button | `1.5rem` (pill) | `0.75rem` |
| input | `0.75rem` | `0.625rem` |
| card | `1.5rem` | `1.25rem` |
| card-sm | `1rem` | `0.875rem` |
| card-xs | `0.75rem` | `0.5rem` |

Cards stay clearly rounded (friendly, album-art-ish) but buttons drop off the
pill, which is the single most recognisable "we restyled this" cue.

> **Implementation gotcha, and why this needed care.** `config/themes.php`
> defines `--be-button-radius`, `--be-input-radius`, `--be-panel-radius` — but
> **nothing reads those names**. The stylesheet reads `--be-radius-button`,
> `--be-radius-input`, `--be-radius-card`, `--be-radius-card-sm`,
> `--be-radius-card-xs` (`common-tailwind.css:59-63`), and those in turn are
> overridden by `.radius-*` classes on `<html>` (lines 156-195). Production emits
> `class="light radius-default"`, and **`.radius-default` is not defined
> anywhere** — so no override applies and everything falls through to the
> Tailwind scale. The config's radius block has been inert this whole time.
>
> Fix: emit the **correct** token names from the theme, and pin the signature in
> an app-owned CSS layer rather than editing the vendor stylesheet.

## 3. Type pairing

> **Status: A chosen and implemented.**

Body/UI resolves to `var(--be-font-family, var(--font-sans))` in `common.css`.
`--font-sans` is Tailwind's system stack. An earlier revision of this document
claimed the body face was "already Inter via `--font-sans`" — that was wrong:
`@fontsource-variable/inter` is in `package.json` but nothing imports it, so it
is a dead dependency, exactly as this document already noted in the "what looks
generic" section above. Inter can still reach the page if the **database theme
row** carries a `font_family`, because the vendor layout then links it from
Google Fonts. Whether it is set is a live-setting question this repo cannot
answer.

Headings and brand moments get a display face with actual personality.

| Option | Display face | Reads as | Verdict |
|---|---|---|---|
| **A (chosen)** | **Bricolage Grotesque** | Editorial, expressive, slightly odd | Most distinctive. Earns its place. |
| B | Space Grotesk | Technical, engineered | Safe, still clearly not Inter |
| C | Sora | Smooth, rounded, friendly | Least distinctive of the three |

Applied as: hero titles, artist/playlist names, player screen headings, section
headings, and the wordmark. Never on body copy, list rows, or tables.

### Self-hosted, and why

Bricolage is loaded from `public/fonts/bricolage-grotesque-latin-variable.woff2`
with a `@font-face` in `resources/client/keekii-brand.css` and a `<link
rel="preload">` in `resources/views/app.blade.php`. It was previously a Google
Fonts `<link>`, which was render-blocking and added two third-party origins to
the critical path of the most visible text on the page.

Three details that are easy to get wrong:

- It is the **"standard"** variable file, carrying `wght`, `wdth` **and** `opsz`.
  The `wght`-only file is 68KB smaller but silently drops the optical-size axis
  that `.keekii-display` asks for with `font-variation-settings: 'opsz' 32`.
- The family name is **`Bricolage Grotesque Variable`**, not `Bricolage
  Grotesque`. The name is what the font declares, and the plain name is kept
  second in the stack so a locally installed copy still wins.
- The preload needs `crossorigin` even though the file is same-origin. Font
  fetches are always CORS-mode, and without it the browser downloads the file
  twice — once for the preload, once for the `@font-face`.

Latin subset only, 131KB. The full family also ships latin-ext and Vietnamese;
neither is needed for the product's copy.

## 4. Motion signature

The vendor leans on a single 200ms-ish ease everywhere. Keekii introduces one
named curve and uses it consistently for anything that enters or leaves:

```
--keekii-ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)   /* entrances */
--keekii-dur-quick: 140ms   /* hover, press, colour */
--keekii-dur-enter: 320ms   /* mount, expand, page-level */
```

Rationale: hover feedback at 140ms feels instant, while 320ms on entrances makes
panels and heroes feel like they arrive rather than pop. Keeping both values
named in one place is what stops a codebase drifting back to
`transition-colors` defaults.

## 5. Chart palette

`--be-chart-1..5` are hard-coded vendor blues in `common-tailwind.css:12-16`,
outside the themeable token set. They are overridden to a single ember ramp so
analytics surfaces match the brand.

Two defects were corrected. Series 3-5 sat on violet (hue 292/328) even after
the violet accent was dropped from the palette, putting purple bars on a
deliberately all-warm theme. And `chart-2` was amber at `L=0.706`, which
measures **2.64:1** on the light background — under the 3:1 WCAG threshold for
meaningful non-text graphics, so that bar was genuinely hard to see on a
near-white chart.

The ramp now descends evenly in OKLCH lightness (~0.042 per step) while the hue
drifts within the warm arc (41/56/30/46/70) and chroma pulls back, so adjacent
series separate without any of them going grey:

| series | on light `#fefcf9` | on dark `#110c08` |
| ------ | ------------------ | ----------------- |
| 1      | 3.21:1             | 5.92:1            |
| 2      | 3.71:1             | 5.12:1            |
| 3      | 4.49:1             | 4.23:1            |
| 4      | 5.22:1             | 3.64:1            |
| 5      | 6.01:1             | 3.16:1            |

All ten pairs clear 3:1. The light-theme window is tight — anything above
roughly `L=0.67` falls under 3:1 on a near-white background — which is why this
ramp tops out at `0.665` and the *lightest* series is the last one, not the
first.

## 5b. The mark — "Twin Pulse" (Concept B)

The wordmark's two `i`s are the identity. The mark reduces them to the simplest
equaliser: **two vertical bars, each topped by a dot**. The dot is what makes it
read as *ii* rather than as a generic bar chart, and the one-tall/one-short
height difference is the "peak pulse" static frame — a single beat, frozen.

```
  ⬤   ⬤        ⬤ = dot, d = 230 (1.15x bar width)
  █   █        █ = bar, w = 200, rounded r = 60
  █   █        tall h = 400, short h = 250
  █   █
```

Geometry is fixed in a 1024 unit space so the mark is reproducible:

| element  | value                                              |
| -------- | -------------------------------------------------- |
| bar      | `w 200`, `rx 60` (30% of width — matches §2 radius) |
| bars     | `x 232` and `x 592` (gap 160), baseline `y 872`     |
| heights  | tall `400` (top `472`), short `250` (top `622`)     |
| dots     | `d 230` at `(332, 267)` and `(692, 417)`            |
| dot gap  | `90` clear space between dot and bar top            |

Rendered bounds are `217,152 → 807,872`, i.e. a 590×720 block with ≥150 clear
space on every side — the padding is part of the mark, not slack.

**Files** (source of truth is `resources/client/brand/`):

- `keekii-mark.svg` — `currentColor`, one file for both themes
- `keekii-mark-light.svg` / `keekii-mark-dark.svg` — explicit theme tokens
- `keekii-mark-1024-ember.png` / `keekii-mark-1024-plum.png` — raster masters
- `keekii-loader.svg` — the earlier hand-built placeholder. Superseded: the
  loader now renders `keekii-mark-animated-{light,dark}.svg`, whose static frame
  is the wordmark's own `k` rather than a stand-in
- `keekii-mark-animated-{light,dark}.svg` — what ships, for the app loader and
  the service worker. Bars stretch from the baseline and the dots drop; the
  static frame is identical to the wordmark

Colours are the actual brand tokens, not eyeballed hex: `#e85f23` is
`oklch(0.652 0.183 41)` (light primary), `#f47b43` is `oklch(0.712 0.164 44)`
(dark primary).

**Dot size is load-bearing.** At 1.15× the bar width the dots survive the 16px
favicon render; at 1.0× they close up and the mark degrades into two bars.

**Applying the favicon/app icon.** The favicon is a DB setting, not a build
artefact, so the master has to go through the admin pipeline once:

1. Admin → Settings → General → Branding → Favicon, upload
   `keekii-mark-1024-ember.png` (or the dark one). The image is stored in
   `storage/app` and `GenerateFavicon` emits
   `public/favicon/icon-{16..512}.png` + `favicon.ico` via Intervention Image
   (`coverDown`, so the square master is used as-is) and saves
   `branding.favicon`.

`GenerateFavicon` runs on the **GD driver, which cannot read SVG** — upload the
PNG master, not the SVG. GD is also absent from the dev container, so the PNGs
are committed rather than rasterised at build time.

The animated loader markup is inlined in `resources/views/loader/app-loader.blade.php`
(pre-hydration, so it must not depend on the bundle). It uses the same
coordinates as the master, but its `viewBox` is cropped to the mark's bounding
box plus a 17px margin so the glyph fills the slot instead of sitting inside the
master's 1024-unit padding.

**Loader bug (fixed): the loader was 549px off-centre in both themes.** The live
view is `resources/views/app.blade.php` (`RendersClientSideApp` calls
`view('app')`), and it still contains a legacy snippet:

```js
setTimeout(function () {
  var spinner = document.querySelector('.global-spinner');
  if (spinner) spinner.style.display = 'flex';
}, 100);
```

The loader carried the legacy `global-spinner` class for "backwards
compatibility", so 100ms after paint that snippet set an **inline**
`display: flex`, which beats any class rule. The `display: grid` that centres the
glow and the stage became a flex row pinned to the top-left. Nothing in the
codebase styles or targets `.global-spinner`, and the reveal is already a CSS
opacity animation, so the class was dropped from the loader.

Measured on a 1280×720 viewport, past the 100ms override:

| | `display` | stage x | offset from centre |
|---|---|---|---|
| before | `flex` | 24 | **549px** |
| after | `grid` | 573 | 1px |

The colour variables were never at fault — a static repro resolved
`oklch(0.712 0.164 44)` on the dark surface correctly. It read as "dark is
broken" because on dark the mis-placed loader sits on a background identical to
the app's own, hiding the error; on light the shift is at least visible.

### 5c. The wordmark — "Keek" + Twin Pulse as the "ii"

The mark alone is an icon, not a logo. The wordmark sets **Keek** in real
Bricolage Grotesque outlines and lets the Twin Pulse become the two `i`s, so the
name and the mark are one drawing.

- Weight 700, `unitsPerEm` 1000, `sxHeight` 525, `sCapHeight` 660
- Letters are real outlines, not live text: converted with
  `fontTools.pens.svgPathPen.SVGPathPen` (curves flattened at 24 segments/curve),
  so there is no webfont dependency in the logo files
- `TRACKING = 20` font units of optical tracking between letters

**The pulse is a variant of the mark, not a copy.** The standalone mark has
*asymmetric* stems (400/250) so it reads as a pulse; two equal stems are what
makes it read as the letters `ii`. Inside the wordmark the stems are therefore
equal, x-height tall (525), and baseline-aligned.

Everything is measured off the font, not guessed:

| Quantity | Value | Source |
|---|---|---|
| i stem width | 144 | `i` = `dotlessi` + `uni0307` composite |
| i stem positions | x = 66, 343 | so the pair keeps the type's rhythm |
| i dot top | 744 | |
| pulse stem width | 160 | wider than the type's 144 so the mark reads at logo size |
| bar-to-bar gap | 117 | 343 − 226 |
| dot diameter | 184 | mark's 1.15× bar width |
| dot centre y | 696 | starts at the type's 79u gap above x-height |

`i` is a composite glyph, so measuring it needs
`DecomposingRecordingPen` — `RecordingPen` reports `addComponent` and yields no
contours. The pulse's dots overhang their stems by 12u, so the pulse ink is
445u wide against the typeset `ii`'s 421u.

Final lockup: 3002×862 units, **3.483:1**, 30u padding on all sides, ink
`x 73..3015  y -14..788`. The dot tops (788) sit 73u above the `k` ascender
(715), so the pulse is the tallest element and draws the eye.

Files in `resources/client/brand/`:

- `keekii-wordmark.svg` — themeable, driven by `--keekii-wordmark-ink` and
  `--keekii-wordmark-pulse` with literal fallbacks
- `keekii-wordmark-light.svg` / `keekii-wordmark-dark.svg` — explicit tokens
- `keekii-wordmark-light.png` / `keekii-wordmark-dark.png` — 2048×588, transparent

The PNGs are rasterised from the *same* flattened contours the SVGs are emitted
from (`build-wordmark.py` → `render-wordmark.js`, nonzero-winding scanline fill
with 4× vertical supersampling and exact horizontal span coverage), so the two
cannot drift. No `sharp`, GD, `canvas` or `playwright` is available in the dev
container.

**Applying the wordmark.** The navbar renders `branding.logo_light` /
`branding.logo_dark` as an `<img src>`
(`common/foundation/resources/client/ui/navigation/navbar/logo.tsx`), so this is
the same one-time upload as the favicon: Admin → Settings → General → Branding →
Logo. Upload `keekii-wordmark-light.svg` to the logo shown on dark surfaces and
`keekii-wordmark-dark.svg` to the one shown on light surfaces — the setting names
are inverted relative to intuition, so check the rendered result.

The Twin Pulse now travels with the wordmark rather than standing in for it.
`public/images/logo-{light,dark}.svg` are the wordmark with the `ii` wired to the
same pulse the favicon and loader use, and they are what the settings point at,
so the navbar, auth pages and installer all move together. They are generated by
`scripts/build-wordmark-logo.ps1`; edit that rather than the output. Email is the
one exception and reads `logo-*-static.svg`, because mail clients drop or flatten
animated SVG.

### 5d. Country channels

15 public channels, one per market, at `country-<iso2>`. They are **generated,
not hand-made**: `php artisan channels:country`.

Countries were not new entities — an artist's country already lives on its
profile (`profile_details.country`, formerly `user_profiles.country`). So rather
than a `Country` model and a lookup table, country channels are a *channel
config key* plus a query filter:

- `config.contentCountry` — ISO 3166-1 alpha-2, read by
  `Common\Channels\LoadChannelContent::applyCountryFilter()` and applied to the
  base query so it survives the datasource's ordering and pagination
- `App\Traits\ScopesByCountry` — `scopeInCountry()`, which normalises the code
  and produces two shapes:
  - `Artist` → `whereHas('profile', fn => where('country', $iso2))`
  - `Album` / `Track` → `whereHas('artists', …whereHas('profile', …))`, via
    their `countryOwnerRelation()` override
- Models without the scope are left untouched rather than erroring, so a channel
  pointed at an unsupported model degrades to unfiltered instead of 500ing

Markets: NG, US, GB, IE, CA, AU, ZA, GH, IN, BR, DE, FR, ES, JP, KR. Each shows
artists ordered by popularity. WA, TZ, KE and EG are one JSON entry away.

The command is idempotent (`updateOrCreate` by slug), reports the **real artist
count per market** before writing anything, and refuses to map markets with zero
artists unless `--include-empty` is passed. It also merges into any existing
`homepage.geo_countries` so hand-added countries survive. If artist profile
country data has not been imported yet, every market will report `EMPTY` and
the geo map is left alone — that is the expected first run on a fresh catalogue,
and the reason the mapping is driven by measured content rather than by the
country list.

`--dry-run`, `--no-geo` and `--include-empty` are available; `--dry-run` prints
the mapping it would write without touching anything.

When markets come back `EMPTY` the command does not just shrug — it dumps the
most common values actually stored in `profile_details.country` and flags any
that are not upper-case ISO alpha-2, because "no data" and "data stored as
lowercase / 3-letter codes / full names" look identical from the outside and
need opposite fixes. The reported counts come from the same
`scopeInCountry()` the channel filters on, so a count can never disagree with
what a visitor would see.

---

# Roadmap (not yet implemented)

### 6. Homepage restructure — signature first 3 seconds

The homepage is **data-driven, not code-driven**: `homepage-channel-page.tsx`
resolves `settings('homepage')` to a channel slug (`discover` by default) and
hands off to the shared `ChannelPage`, which renders DB-defined sections. So the
lever is *presentation*, not content — no backend, routing, or fetching changes.

- **Hero.** Add a Keekii hero treatment at the top of the channel: full-bleed
  gradient wash keyed to the featured artist's artwork, display-face title,
  one primary action. Currently the page opens straight into a grid-of-cards,
  which is the stock pattern.
- **Featured row.** Replace the uniform card row with an asymmetric layout —
  one large "cover feature" plus a tight stack of smaller items. Breaks the
  equal-card rhythm immediately.
- **Section headings.** Display face + an ember rule, replacing the plain
  bold-label + grid.
- **Lists vs. grids.** Force long track lists to a list layout and reserve
  grids for genuinely visual content, so the page alternates rhythm instead of
  being six identical shelves.

### 7. Micro-details still on vendor defaults

| Surface | Status | Action |
|---|---|---|
| Favicon / app icons | Twin Pulse master now committed at `resources/client/brand/`; generation is still by `Common\Settings\GenerateFavicon` from the last **uploaded** image | One-time manual step: upload the PNG master via admin branding; all 8 sizes + `favicon.ico` regenerate. No code change. Code side is **done**, not live until that upload happens. See §5b. |
| Wordmark | `Keek` + Twin Pulse drawn in `resources/client/brand/` (SVG + 2048×588 PNG, light/dark) | One-time manual step: upload the two SVGs via admin branding. Code side is **done**, not live until that upload happens. See §5c. |
| `manifest.json` | Vendor `manifest-example.json` | Set Keekii name/short_name/theme colour to match tokens. |
| Empty states | `shadcn/empty` + `notification-empty-state.tsx`, generic | Replace the generic glyph with an equaliser motif, warm-tinted, display-face heading. |
| Page `<title>` | `branding.site_name` updated to `Keekii` | Done (operator action). The loader's hard-coded `Keeki Pod` fallback was replaced with `Keekii`. |
| Iconography | `lucide-react` throughout | Acceptable. Selective swap of the ~6 most-visible player/nav glyphs to a custom set is a later pass. |
| `--be-font-family` | Body face comes from the theme row via Google Fonts, or falls back to Tailwind's `--font-sans` system stack. `@fontsource-variable/inter` is installed but never imported, so Inter is only in play if the DB row names it. | Settled as-is: body copy keeps the system stack. Deciding whether to adopt Inter is a separate call from the display face, and should not be made as a side effect. The display face is **done** — self-hosted, preloaded, see §3. |

### 8. Known-unrelated bug

`/discover` returns **HTTP 422** from `api/v1/img-proxy` for 5 genre images
(`piano`, `funk`, `hard-rock`, `classical`, …), so genre thumbnails are broken.
Not branding; worth a separate ticket.
