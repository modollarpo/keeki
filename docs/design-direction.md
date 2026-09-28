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

## 1. Palette — "Ember & Ink"

Warm, lit-from-within, like a record sleeve under a lamp. The organising idea is
**chroma in the neutrals**: greys are warmed toward the primary's hue so the
whole surface feels lit rather than switched off. This is the change that
separates the product at a glance more than any single accent.

| Token | Keekii light | Keekii dark | Intent |
|---|---|---|---|
| `--be-primary` | `oklch(0.652 0.183 41)` | `oklch(0.712 0.164 44)` | Ember. Vivid, warm, high energy |
| `--be-accent` | `oklch(0.58 0.19 292)` | `oklch(0.68 0.16 294)` | Violet. Night/club counterweight |
| `--be-background` | `oklch(0.992 0.005 85)` | `oklch(0.168 0.021 292)` | Warm paper / deep ink-plum |
| `--be-foreground` | `oklch(0.223 0.021 55)` | `oklch(0.972 0.008 85)` | Warm near-black / warm white |

Notes:
- The dark background is **plum-tinted, not black**. Pure `oklch(0.0969 0 0)` is
  the vendor default and reads as an unfinished dev build.
- Chroma stays under ~0.02 in neutrals — enough to feel warm, low enough that
  text contrast and long-list legibility are unaffected.
- `--be-primary` is dark-mode *lightened and slightly de-saturated* rather than
  reused verbatim, so it stays legible on ink without glowing.

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

Body/UI stays **Inter** (already the system sans via `--font-sans`) because the
UI is dense — tables, track lists, settings — and Inter is the right neutral for
that. Headings and brand moments get a display face with actual personality.

| Option | Display face | Reads as | Verdict |
|---|---|---|---|
| **A (recommended)** | **Bricolage Grotesque** | Editorial, expressive, slightly odd | Most distinctive. Earns its place. |
| B | Space Grotesk | Technical, engineered | Safe, still clearly not Inter |
| C | Sora | Smooth, rounded, friendly | Least distinctive of the three |

**Recommendation: A.** The whole point of this pass is to stop looking
off-the-shelf, and B/C both still read as "startup sans". Bricolage is
variable, has real optical size range, and its quirk works at display sizes
without harming the dense UI beneath it.

Applied as: hero titles, artist/playlist names, player screen headings, section
headings, and the wordmark. Never on body copy, list rows, or tables.

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
outside the themeable token set. They are overridden to an ember→violet ramp so
analytics surfaces match the brand.

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
- `keekii-loader.svg` — animated, bars stretch from the baseline and the dots
  lift; static frame is identical to `keekii-mark.svg`

Colours are the actual brand tokens, not eyeballed hex: `#e85f23` is
`oklch(0.652 0.183 41)` (light primary), `#f47b43` is `oklch(0.712 0.164 44)`
(dark primary).

**Dot size is load-bearing.** At 1.15× the bar width the dots survive the 16px
favicon render; at 1.0× they close up and the mark degrades into two bars.

**Applying the favicon/app icon.** The favicon is a DB setting, not a build
artefact, so the master has to go through the admin pipeline once:

1. Admin → Branding → Favicon, upload `keekii-mark-1024-ember.png` (or the dark
   one). The image is stored in `storage/app` and `GenerateFavicon` emits
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
| `manifest.json` | Vendor `manifest-example.json` | Set Keekii name/short_name/theme colour to match tokens. |
| Empty states | `shadcn/empty` + `notification-empty-state.tsx`, generic | Replace the generic glyph with an equaliser motif, warm-tinted, display-face heading. |
| Page `<title>` | Still `Keeki Pod` | Rename `branding.site_name` to `Keekii` (separate fix, flagged earlier). |
| Iconography | `lucide-react` throughout | Acceptable. Selective swap of the ~6 most-visible player/nav glyphs to a custom set is a later pass. |
| `--be-font-family` | Inter via theme, Google-Fonts-capable but unset | Keekii display face is added as a separate, deliberate pairing. |

### 8. Known-unrelated bug

`/discover` returns **HTTP 422** from `api/v1/img-proxy` for 5 genre images
(`piano`, `funk`, `hard-rock`, `classical`, …), so genre thumbnails are broken.
Not branding; worth a separate ticket.
