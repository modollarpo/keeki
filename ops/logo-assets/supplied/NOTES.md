# Supplied artwork (reference only — not what ships)

These four files are the Keekii logo pair exactly as supplied in
`C:\Users\USER\Downloads\files (3)`, copied here **byte-for-byte**. They are
unmodified: the SVGs still carry their four C2PA content credentials, so do not
run any optimiser, editor round-trip, or formatter over them — that would strip
the provenance and break the signatures.

| File | Size | Notes |
| --- | --- | --- |
| `keekii-logo-dark.svg` | viewBox `8.7 5 127.3 49` | dark ink `#131311` letters, orange `i` pair |
| `keekii-logo-light.svg` | viewBox `8.7 5 127.3 49` | white `#ffffff` letters, orange `i` pair |
| `keekii-logo-dark.png` | 900×382 | **superseded** — wrong aspect, pure black ink |
| `keekii-logo-light.png` | 900×382 | **superseded** — wrong aspect, monochrome, no orange |

## Why these are not the shipped logo

The lettering is **bespoke, not Bricolage Grotesque** — the app's display face.
The wordmark is a single fully-outlined path, so it carries no font metadata and
the typeface has to be recovered by measuring. Rasterising the artwork and
comparing each glyph against every candidate font, normalised on the `e`'s ink
height and aligned on a shared baseline:

| Comparison | `k` | `e` |
| --- | --- | --- |
| Same glyph through two different rasterisers (the metric's ceiling) | 0.988 | 0.995 |
| **Supplied artwork vs Bricolage Grotesque w700 / opsz 32** | **0.790** | **0.910** |
| Shipped rebuild vs the same font | 0.997 | 0.993 |

`k` at 0.790 against a ~0.99 ceiling is not a match. The closest stock relative
is Arial Bold (0.870 mean); Bricolage is not the source. The two `i`s are also
deliberately different heights (1.49× and 2.00× the x-height), which no font
setting produces.

Two smaller defects, both fixed in the shipped version:

- The 900×382 PNGs are a 2.356 aspect against the artwork's real 2.616, so the
  wordmark was letterboxed inside its own frame with dead margin and rendered
  smaller than a sibling logo of the true height.
- `viewBox` is `8.7 5 127.3 49`, ending at x=136, but the tall `i`'s dot runs to
  x=137 — the artwork clips its own right edge by one unit.

## What ships instead

`ops/logo-assets/keekii-logo-{dark,light}.svg` and their 900×344 PNGs, generated
by `scripts/build-wordmark.py` from the self-hosted variable font:

- `keek`, drawn from the real Bricolage Grotesque outlines at wght 700 / opsz 32,
  the same instance the CSS applies via `font-variation-settings: 'opsz' 32`.
- The twin-pulse `i` pair kept as the supplied geometry — rounded rect stem plus
  circular dot, in the two sampled orange tones — because that is the brand's
  identity mark rather than a letterform, and it cannot be set as type.
- Same orange pair, `#e8611f` and `#f0864a`, now exposed as the
  `--be-brand-ink` / `--be-brand-ink-alt` theme tokens.

The rebuild measures 0.992–0.997 against the font, i.e. indistinguishable from
the typeface itself, and preserves the tall/short `i` rhythm at 1.49× and 2.00×
the x-height. Aspect is 2.6158, +0.7% on the supplied 2.5980, with the right
edge no longer clipped.

Regenerate with:

```
python scripts/build-wordmark.py \
  --font public/fonts/bricolage-grotesque-latin-variable.woff2 \
  --out-dark ops/logo-assets/keekii-logo-dark.svg \
  --out-light ops/logo-assets/keekii-logo-light.svg \
  --png-dark ops/logo-assets/keekii-logo-dark.png \
  --png-light ops/logo-assets/keekii-logo-light.png
```
