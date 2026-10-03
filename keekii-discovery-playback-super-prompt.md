# Super-prompt: Keekii discovery and playback — personalization, autoplay, and playback-quality gaps

You are a senior staff full-stack engineer. Keekii
(`github.com/modollarpo/keekii.git`) has real infrastructure for
personalization and recommendations already built — it just isn't surfaced
to listeners yet. This pass connects what exists and fills the specific
gaps found by direct inspection of the current codebase. Pull latest before
starting; findings below were confirmed against the repo as of early
October 2026 — re-verify each one, since the repo moves fast.

This is backend-and-frontend work across the player, not the landing page
or the general visual-polish pass (those have their own prompts).

## 0. What's already built — reuse it, don't rebuild it

1. **A real recommendations engine exists.** `RadioController::getRecommendations`
   takes an artist/genre/track as a seed, calls
   `MusicMetadataProvider::getRecommendations` (backed by
   `SpotifyRadio` among other providers), and caches results for 2 days.
   This is the seed for both autoplay (workstream A) and personalized
   homepage rows (workstream B) — do not build a second recommendation
   system.
2. **Play history is tracked.** `TrackPlay` records plays. Confirm its
   current shape (per-user? timestamped? track-only or album/artist too?)
   in phase 0 — it's the data source for "Recently played"/"Listen again."
3. **The channel system is flexible but has exactly three content types:**
   `listAll`, `manual`, `autoUpdate` (see
   `common/foundation/.../channel-editor/controls/content-type-field.tsx`).
   There is no personalized/per-user type. Workstream B adds one rather
   than bending an existing type to fit.
4. **Per-channel layout is already configurable.** Each channel has
   `config.layout` and `config.nestedLayout`, with options depending on the
   content model (`modelConfig.layoutMethods`). This is unused variety, not
   a missing feature — workstream D is largely a content/config task.
5. **Geo-targeted channels already exist but are switched off.**
   `resources/defaults/channels/country-channels.json` defines
   country-specific channels (Nigerian music, American music, etc.), and
   `homepage.geo_countries` is a real setting — currently an empty string.
   Workstream C activates this; it is close to a config change, not new
   engineering.
6. **The homepage currently shows about four rows**: New releases, Popular
   albums, Popular tracks, Popular artists (channel ID 8, confirm this is
   still accurate). This is the baseline workstream B and C are improving
   on.

## 1. Confirmed gaps (the scope of this pass)

Re-verify each in phase 0:

1. **No autoplay/continuation.** When the queue ends, playback stops.
   `RadioController`'s recommendations are only triggered manually (seeding
   a radio station), never automatically.
2. **No personalized homepage content type**, per section 0.3 — "Quick
   picks," "Made for you," "Recently played" aren't buildable with the
   current channel system.
3. **No synced/time-stamped lyrics.** `LyricsController` and the lyrics
   feature return static text, not line-level timestamps — no karaoke-style
   highlighting is possible as-is.
4. **No sleep timer.**
5. **No crossfade** between tracks.
6. **No casting (Chromecast/AirPlay).**
7. **No mood/activity browsing** — only genre (`genres/`), confirmed
   earlier against the catalog browse surface.

## 2. Phase 0 — Audit (mandatory before any code)

- Confirm `TrackPlay`'s actual schema and whether it's already queryable
  per-user with enough fidelity for "recently played" and "because you
  listened to X."
- Confirm channel ID 8's current row count/config hasn't changed.
- Confirm `homepage.geo_countries`'s current value and how the homepage
  resolves it when non-empty (read the resolution code, don't assume).
- Confirm what `layoutMethods` actually contains per content model (albums,
  artists, tracks, playlists) — this determines how much visual variety is
  actually available without new component work.
- Confirm `RadioController::getRecommendations`'s real latency and cache
  behavior under load — it's about to be called automatically (workstream
  A) instead of only on-demand, which changes its traffic pattern.

Post a findings brief with file references before writing code.

## 3. Workstreams, in priority order

### A. Autoplay / continuous playback (highest listener-facing impact)
When the queue is about to end (or has ended), automatically pull
recommendations for the last-played track/artist via the existing
`RadioController`/`MusicMetadataProvider` pipeline and append them to the
queue, the way Spotify/YouTube Music radio-mode does. Requirements:
- A setting to turn this off (some listeners want playback to just stop).
- Clear UI indication that the queue is now auto-continuing ("Autoplay" or
  similar), with a way to stop it mid-stream, not just a silent mode switch.
- Must not block or stutter playback — recommendations are fetched ahead of
  the queue running out, not at the moment it hits zero.
- Respect whatever licensing/availability constraints already govern
  manual radio recommendations (if a track can't be played in some
  context, autoplay shouldn't queue it either).

### B. Personalized channel content type (biggest lift, biggest payoff)
Add a new channel `contentType` (e.g. `personalized`) backed by the current
user's own data:
- **Recently played / Listen again** — from `TrackPlay`.
- **Made for you / Quick picks** — from `RadioController`'s recommendation
  pipeline, seeded from the user's recent listening rather than a single
  artist/genre/track.
Build this as a genuine new channel type usable from the existing admin
channel editor (so non-engineers can place/reorder it like any other
channel), not a hardcoded homepage section. Each row must degrade sensibly
for a user with no history yet (new signup) — don't show an empty or
broken row; fall back to a sensible default (e.g. popular tracks) until
there's enough history to personalize.

### C. Activate geo-personalization
Wire `homepage.geo_countries` so a visitor's resolved country (however the
app currently determines locale/region — confirm in phase 0) surfaces the
matching channel from `country-channels.json` as a homepage row when one
exists, falling back gracefully when it doesn't. This should be close to
configuration plus the resolution logic — confirm in phase 0 whether that
logic already exists partially.

### D. Vary homepage row layouts
Using the real `layoutMethods` options found in phase 0, apply different
`layout`/`nestedLayout` values across the homepage's rows so they aren't
all the same grid treatment — e.g., a featured/larger treatment for one row,
a tighter grid for another, a carousel for a third, as the available
methods allow. This is primarily a content/config change against the
existing admin system, not new components — only build new layout methods
if phase 0 shows the existing ones are too limited to create real variety.

### E. A few more curated rows
Add 2–4 more `autoUpdate`/`manual` rows using the existing channel system —
e.g. a charts row, a mood-themed manual row, a genre spotlight. This is
content/config work using infrastructure that already exists; don't scope
engineering time to it beyond what's needed to create the channels.

### F. Mood/activity browsing
Extend or complement the existing genre browse (`genres/`) with
mood/activity groupings (e.g. Workout, Chill, Focus, Party). Decide, and
state your reasoning, whether this reuses the `Genre` model with a type
flag or is a genuinely separate concept — don't conflate them if the data
shapes don't fit.

### G. Synced lyrics
If lyrics data with line-level timestamps is obtainable from any existing
metadata provider (check `MusicMetadataProvider`'s provider list — Spotify,
Deezer, etc. — for anything beyond static text), extend `LyricsController`
and the lyrics UI to highlight the current line in sync with playback. If
no provider offers timestamped lyrics, state that clearly rather than
building a half-working sync against static text — this may be a "flag and
defer" item rather than something to build in this pass.

### H. Sleep timer
A straightforward player-state feature: let a listener set a timer after
which playback pauses. Low engineering cost, real quality-of-life value —
treat as a quick win alongside C and D if time allows.

### I. Crossfade
Configurable crossfade duration between tracks. Note the real engineering
cost here before committing: this requires decent control over the audio
pipeline (dual audio elements or Web Audio API gain scheduling) — confirm
in phase 0 what the current playback implementation is built on
(`<audio>` element vs. Web Audio API) before estimating this, since the
honest cost differs a lot between the two.

### J. Casting (Chromecast / AirPlay)
Flagged as a real gap, not scoped into this pass — casting typically
requires a receiver app and platform-specific SDKs, which is a larger,
separate initiative. Note it in your final report as a recommended future
project rather than attempting it here, unless you find it's materially
simpler than expected for this stack.

## 4. Hard constraints

1. **`common/foundation` is shared vendor code** — prefer
   `resources/client/`/`app/` for Keekii-specific logic; keep any
   `common/` diff minimal and listed in the final report (the channel
   content-type addition in workstream B will likely need to touch
   `common/foundation`'s channel editor — that's expected and fine, just
   keep it as clean an extension as possible, not a fork).
2. **Settings/config stay backward compatible.** Existing channels and
   their stored config must keep working unchanged.
3. **Measure before claiming.** Baseline `tsc --noEmit --skipLibCheck`
   error count; add zero new errors. Attempt `vite build` and report the
   real result. For workstream A/B, measure actual recommendation-fetch
   latency under realistic conditions, not just "it works locally."
4. **Performance.** Autoplay fetching (A) and personalized rows (B) must
   not block playback start or homepage load — fetch ahead/async with
   sensible fallbacks.
5. **Privacy.** Personalized rows (B) and autoplay (A) use the user's own
   listening data — confirm this respects whatever privacy/data settings
   already exist in the app (e.g. a user who has disabled history tracking
   should not silently get personalization built from history they opted
   out of).
6. **No invented product decisions.** Where there's a genuine judgment call
   (mood-as-genre-type vs. separate concept; crossfade's real feasibility
   given the current audio implementation; what "Made for you" should be
   called in the UI), state the trade-off and your recommendation, flagged
   as a decision point in the final report.

## 5. Process

**Phase 0 — Audit** (section 2). Post findings before writing code.

**Phase 1 — Quick wins.** C (geo-activation), D (layout variety), H (sleep
timer) — small, low-risk, shippable independently.

**Phase 2 — Autoplay.** A, built on the existing recommendations pipeline.

**Phase 3 — Personalized channels.** B — the biggest workstream; build the
new content type, then the two row types (Recently played, Made for you)
on top of it.

**Phase 4 — Additional rows and mood browsing.** E and F.

**Phase 5 — Playback quality.** G (synced lyrics, if feasible per phase 0)
and I (crossfade, with an honest cost estimate first) — only commit to
building these if phase 0's investigation shows they're tractable; otherwise
document them as scoped-but-deferred.

**Phase 6 — Report.** What shipped vs. what was deferred and why; how
workstream B's personalization degrades for new users; autoplay's
opt-out mechanism; every `common/` file touched; before/after TS error
count and build result; latency measurements for recommendation fetching;
unresolved decision points; a clear recommendation on whether casting (J)
is worth a dedicated future project.

Stop and ask rather than guess on: what to call "Made for you" in the UI,
whether mood browsing reuses `Genre` or needs its own model, and whether
crossfade's real engineering cost (once phase 0 reveals the current audio
implementation) is worth it for this pass versus deferring.
