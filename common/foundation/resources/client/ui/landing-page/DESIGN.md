# Landing Page Redesign — Design Decisions

## Objective
Redesign the landing page builder output as a dark, Spotify‑like audio‑app design while preserving enterprise‑grade code quality. The stored JSON config (9 sections in `settings` row `name='landingPage'`) remains unchanged; only the **render contract** and **admin knobs** are extended.

## Schema & Types
- **`SectionPresentation`** (variant / background / spacing / alignment) added optional to every section config type (`& SectionPresentation`).
- New types: `SectionBackground = 'default' | 'muted' | 'panel' | 'elevated'`; `SectionSpacing = 'compact' | 'default' | 'spacious'`; `SectionAlign = 'left' | 'center'`.
- Registry `section-defs.tsx` stores for each section: label, description, lucide icon, allowed variants, default variant, default background, default spacing, default align.
- Custom sections (e.g. `channel`) pass through untouched; their name is not in the registry.

## Presentation Contract
- `normalizeSections(rawSections)` runs **at render only**; never mutates stored config.
- Tolerant coercions:
  - `buttons` object → array (handles the live‑config anomaly where buttons were stored as a single object).
  - `features` / `questions` lists filtered & text‑cleaned.
  - `mutedBg === true` → background `'muted'`.
  - Unknown section names passthrough unchanged.
- Variant/background/spacing/align defaults pulled from registry; overridden only when explicitly set in stored JSON.

## Variant Defaults (design‑first)
| Section          | Default Variant | Rationale |
|------------------|-----------------|-----------|
| `hero-with-background-image` | `spotlight` | Cinematic dark: scrim `bg-black/75`, primary glow, badge pill, search pill `bg-white/95`, bottom fade. |
| `features-grid` | `tiles` | Card‑style icons with chips; legacy `list` variant kept for backward compatibility. |
| `cta-simple-centered` | `card` | Card‑style CTA; full‑width `full` variant also supported. |
| `feature-with-screenshot` | `split` | Image left/right with overlay controls; legacy `inPanel`/`forceDarkMode`/`alignLeft` knobs preserved. |
| `faq` | `default` | Bordered / separated variants also defined. |
| `pricing` | `default` | Single‑column plan list. |
| `footer` | `default` | Compact footer. |

## Rendering Contract
- **Hero sections** (above‑fold) stay **eager** (no `Suspense`).
- **Below‑the‑fold sections** lazy‑loaded via `React.lazy` + `Suspense fallback={null}`.
- `SectionShell` provides background classes (`default`/`muted`/`panel`/`elevated`) and spacing (`compact`/`default`/`spacious`).
- `SectionHeading` accepts `badge` ReactNode, `titleClassName`, `align` (`left`/`center`).
- `MediaFrame` renders a chrome frame + glow with `padding md|lg`.
- `SectionNav` offers floating navbar mode or inline logo mode.

## Admin Interface
- New `SectionPresentationSettings` UI: Variant dropdown, Background selector, Spacing radio group, Alignment selector — read via `useWatch` from the landing‑Page context.
- Wired into hero, features‑grid, faq, cta, feature, pricing settings (footer excluded).
- Add‑section gallery rebuilt from `sectionDefs` (icon + label + description) plus `CustomSectionIcon` fallback for custom sections.

## Token Usage
- `--be-*` CSS vars are injected on `html` from the DB `CssTheme` and mapped to Tailwind `--color-*` via `@theme inline` in `common-tailwind.css`.
- Dark mode = `html.dark` through `ColorSchemeContext` (`useIsDarkMode`); a local `.dark` wrapper does **not** flip tokens, so sections rely on existing theme tokens (preserving parity with the pre‑existing behavior). Self‑contained white pill classes used where token forcing would cascade.

## Build / Deployment Notes
- Frontend **cannot be rebuilt locally**: 389 baseline TS errors + missing PostCSS native binding (oxide `.node` binary truncated). This deliverable is **source‑level only** — a successful build elsewhere is required for live visibility.
- `tsc --noEmit` reports **0 new errors**; only pre‑existing `react-hook-form` TS2307 (module‑resolution) appears in every admin‑settings file (environment‑wide baseline).
- Normalizer run against the live DB snapshot confirms all 9 sections normalize correctly (hero → `spotlight`, features → `tiles`, CTA → `card`/`compact`, `channel` passthrough, etc.).
- The original `bemusic-deploy.zip` (103 MB) contained a full repo snapshot (vendor + `public/build` assets). Re‑building that artifact from the current node_modules is blocked by the network‑flakiness / truncated‑package issues described above; a fresh `npm ci` / `vite build` on a stable network will produce the updated bundle.

---
*Source‑level deliverable. Live visibility requires a successful frontend build on a working CI environment.*