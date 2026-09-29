# DJ & continuous-mix roadmap, corrected against this codebase

This replaces the earlier blueprint. That document assumed a Next.js frontend and
described work against a codebase we do not have. Everything below was read out of
this repository; the file references are the evidence.

## What the stack actually is

| Assumption in the old plan | Reality here |
| --- | --- |
| "your Next.js frontend" | React 19 + `react-router`, bundled by Vite, served into a Blade shell. There is no `next` dependency. |
| Laravel backend | Correct. `app/`, `routes/`, `config/horizon.php`. |
| Free audio networks to sync | Same intent, but imports here are **artisan commands**, not a sync service. See `app/Console/Commands/`. |

Entry points: `resources/views/app.blade.php` renders the shell, React mounts
under it, routing lives in `resources/client/` with aliases `@app`, `@common`,
`@ui`, `@shadcn`.

## Correction 1 — the player is single-element, and that is the whole problem

The old plan said "modify the frontend to use the Web Audio API so it blends
seamlessly". That skips the part that makes it hard.

**The player has exactly one media element, and it is swapped on every track
change.**

- `common/foundation/resources/client/player/utils/guess-player-provider.ts` maps
  a `src` to one of five providers: `youtube`, `htmlAudio`, `htmlVideo`, `hls`,
  `dash`.
- `player/ui/player-outlet.tsx` renders **one** provider at a time, chosen from
  `providerName`. There is no second element anywhere in the tree.
- `providers/html-media/use-html-media-api.ts` drives a single `ref.current`.
  Volume is `element.volume`, rate is `element.playbackRate`. There is no
  `GainNode` and no `AudioContext` in the playback path at all.
- `state/player-store.tsx:260` `playNext()` calls `get().stop()` — pause plus
  seek to 0 — and then `play(media)` with the next `src`. That is a hard cut by
  construction.

**Consequence.** Crossfading is not a feature that can be added on top. It
requires two concurrently-decoding elements on a shared `AudioContext`, each
through its own `GainNode`, with the outgoing track ramping down while the
incoming ramps up — and `playNext()` has to stop calling `stop()` first. The
`PlayerProviderApi` interface (`state/player-provider-api.tsx`) is the right seam
to extend, because every provider already conforms to it.

**There is one piece of good news.** `resources/client/web-player/tracks/waveform/generate-waveform-data.ts`
already does real Web Audio work — `AudioContext.decodeAudioData` over a `File`
to extract peaks at upload time. So the project has precedent for decoding audio
in the browser, and that file is where waveform peak data already comes from. It
is offline and upload-only; the playback path is untouched.

## Correction 2 — three of the five providers cannot be beat-matched at all

This is the hard limit, and it is not a matter of effort.

- **`htmlAudio`** — the only provider that can be routed into a custom audio
  graph cleanly. This is where crossfade is buildable.
- **`hls` / `dash`** — `providers/hls-provider.tsx` drives hls.js through an
  MSE-backed `<video>` element. Tapping an element into Web Audio needs
  `createMediaElementSource`, which works, but adds a layer and inherits the
  stream's CORS rules. Possible, not free.
- **`youtube`** — the IFrame Player API is a cross-origin iframe and exposes no
  audio graph at all. There is no supported way to read or alter its samples.
  **Beatmatching a YouTube-sourced track is not implementable in the browser.**

The old plan did not notice this. Any mix feature has to be opt-in per track and
degrade to the current hard cut for anything not `htmlAudio`. That is a product
decision about which catalog is mixable, which loops back to Correction 4.

## Correction 3 — BPM and key detection is greenfield, and this box cannot run it

There is no tempo or key data anywhere in the project:

- `app/Models/Track.php` exposes `duration` as the only audio-derived field.
- No migration in `database/migrations/` defines `bpm`, `key`, or `tempo`.

And the tooling is not present on this machine — `ffmpeg`, `ffprobe`, `aubio`
and `aubiotempo` all fail to resolve. Analysis cannot run locally until at least
ffmpeg is installed, and Aubio is a native C library that needs a build step.

There is also **no job infrastructure in place**: `app/Jobs/` does not exist, and
there is no `config/queue.php`, though `config/horizon.php` is present. So
"scan every song" has no queue to run on. Building analysis means creating the
job layer first, not just adding a column.

Where the column goes, and who writes it, is the actual design question:
server-side batch analysis is cheaper and uniform, but it cannot read the
already-uploaded waveform peaks. Client-side analysis during upload reuses
`generate-waveform-data.ts` and costs the user nothing in infrastructure, but
only ever runs for files uploaded through a browser.

## Correction 4 — sourcing

`config/scout.php` exists, so search runs through Laravel Scout rather than SQL
`LIKE`. An import has to populate the Scout index, not just the database.

The existing precedent for pulling from an external service is a set of artisan
commands: `DownloadDeezerGenres.php`, `DownloadLastfmGenres.php`,
`ImportMissingLyrics.php`, `ResolveYoutubeSources.php`. New importers should
follow that shape — a command you can run and observe, not a scheduled sync
service.

On the sources themselves:

- **Audius** has a public API and is genuinely open. It is the one source here
  where this plan's premise holds.
- **Hearthis.at** and **Internet Archive** have per-item terms and licensing.
  Neither is "free audio" in the sense the old plan assumed; a catalog built from
  them inherits that ambiguity item by item.

The old plan's framing — content Spotify removes for copyright violations — is
the part I would drop rather than build. That describes unauthorised uploads,
which is a takedown liability rather than a moat. If the goal is a DJ tool,
licensed long-form sets from artists who upload them themselves is a real and
defensible catalog.

## Suggested order

Ordered so each step is useful before the next one exists, and so the expensive
commitments come after the cheap ones prove out.

1. **BPM/key analysis, single file, no queue.** Install ffmpeg, add a
   `bpm`/`key` column, prove accuracy on a handful of known-DJ tracks. Do not
   build the job layer until the detection is trustworthy — a wrong BPM that
   drives transitions is worse than no BPM.
2. **Crossfade for `htmlAudio` only.** A second element, a shared `AudioContext`,
   per-element `GainNode`, and a new `PlayerProviderApi` method so providers can
   opt in. Degrade to the current behaviour everywhere else.
3. **Beat-aligned transition.** Only after 1 and 2, and only using real measured
   BPM. Tempo-matching audio pitch (`playbackRate` nudging plus a detune) fights
   the provider contract; the cheap, high-value version is a fixed-length
   crossfade timed to the outgoing track's measured duration.
4. **One licensed importer**, following the existing command shape, writing to
   Scout. Audius first, since its terms are the clearest.
5. **Opt-in mix mode**, so the UI can state plainly which tracks in the queue can
   actually be blended and which cannot.

## What is not worth doing yet

Mixer channels, per-deck EQ, loop and hot-cue pads, recording. Those are a
studio product and they all need the two-deck audio graph from step 2 to exist
first. Building them against the current single-element player means building them
twice.
