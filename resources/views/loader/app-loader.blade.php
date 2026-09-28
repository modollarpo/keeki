{{--
    Keekii branded app loader (pre-hydration loading screen).

    WHY THIS IS A SEPARATE PARTIAL:
    common/foundation is upstream vendor code (see .gitmodules -> RamunasO/common-new).
    Its content is committed into this repo, so the layout at
    common/foundation/resources/views/framework.blade.php is edited in place --
    but the only edit there is a single `@include('loader.app-loader')` hook.
    All loader markup, CSS and JS live HERE, in resources/views/, so refreshing
    or re-syncing the vendor tree can only ever drop the include hook (loader
    reverts to the stock spinner) and can never corrupt this file.
    If the loader ever renders plain/unbranded, check that include still exists.

    Self-contained by design: inlined <style>/<script>, no build step, no
    external requests, no framework dependency. It must paint before the React
    bundle arrives, and must be wiped from the DOM when React mounts into #root.
--}}
@php
    $keekiiLoaderName = settings('branding.site_name') ?: 'Keekii';
    // Fixed bar heights (percent) so the equaliser silhouette is deterministic.
    $keekiiLoaderBars = [34, 58, 86, 48, 100, 72, 40, 80, 62, 92, 46];
@endphp

<style>
    /* All selectors are namespaced under .keekii-loader to stay clear of the
       app's Tailwind build and the vendor foundation styles. */
    .keekii-loader {
        /* Derived from the active theme's brand colour, so the backdrop tint
           follows whatever --be-primary the admin picked. */
        --keekii-loader-tint: color-mix(in oklab, var(--be-primary, #16a34a) 20%, transparent);
        --keekii-eq-speed: 900ms;

        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: grid;
        place-items: center;
        overflow: hidden;
        margin: 0;
        padding: 24px;
        color: var(--be-foreground, currentColor);
        background-color: var(--be-background, #fff);
        font-family: var(--be-font-family, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
        -webkit-tap-highlight-color: transparent;
        /* Deliberately JS-free reveal: avoids a flash of loader on cached/fast
           loads, but still appears if JS never runs. */
        opacity: 0;
        animation: keekii-loader-reveal 220ms ease-out 120ms forwards;
        cursor: pointer;
    }

    .dark .keekii-loader {
        color-scheme: dark;
    }

    .light .keekii-loader {
        color-scheme: light;
    }

    /* Album-art-ish backdrop: a soft brand glow that slowly drifts. Kept as
       gradients (no filter: blur()) so it stays cheap on low-end devices. */
    .keekii-loader__glow {
        position: absolute;
        inset: -25%;
        pointer-events: none;
        background-image: radial-gradient(50% 42% at 50% 46%, var(--keekii-loader-tint), transparent 70%);
        animation: keekii-loader-drift 11s ease-in-out infinite alternate;
        will-change: transform;
    }

    .keekii-loader__stage {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 22px;
        max-width: 100%;
        text-align: center;
    }

    /* Brand mark: "Twin Pulse" (Concept B) -- the two "i"s of Keekii as a
       pair of pulse bars, each topped by a dot. Geometry matches
       resources/client/brand/keekii-mark.svg. */
    .keekii-loader__mark {
        display: block;
        width: clamp(58px, 15vw, 74px);
        height: auto;
        color: var(--be-foreground, currentColor);
    }

    .keekii-loader__mark-bar {
        fill: var(--be-primary, #16a34a);
        transform-box: fill-box;
        /* Scale from the baseline so the bar reads as a pulse rising. */
        transform-origin: 50% 100%;
        animation: keekii-loader-mark-bar 1050ms ease-in-out infinite;
    }

    .keekii-loader__mark-bar--b {
        animation-delay: 160ms;
    }

    .keekii-loader__mark-dot {
        fill: var(--be-primary, #16a34a);
        transform-box: fill-box;
        transform-origin: 50% 50%;
        animation: keekii-loader-mark-dot 1050ms ease-in-out infinite;
    }

    .keekii-loader__mark-dot--b {
        animation-delay: 160ms;
    }

    .keekii-loader__word {
        font-size: clamp(1.75rem, 7vw, 2.5rem);
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: -0.03em;
    }

    /* Equaliser bars. */
    .keekii-loader__eq {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 56px;
    }

    .keekii-loader__bar {
        width: 6px;
        height: calc(var(--keekii-h) * 1%);
        min-height: 5px;
        border-radius: 999px;
        background-color: var(--be-primary, #16a34a);
        transform-origin: 50% 50%;
        animation: keekii-loader-eq var(--keekii-eq-speed, 900ms) ease-in-out infinite alternate;
        animation-delay: calc(var(--keekii-i) * -90ms);
        will-change: transform;
    }

    .keekii-loader__copy {
        margin: 0;
        min-height: 1.5em;
        font-size: 0.9375rem;
        font-weight: 500;
        line-height: 1.5;
        color: var(--be-muted-foreground, currentColor);
        transition:
            opacity 200ms ease,
            transform 200ms ease;
    }

    .keekii-loader__copy.is-swapping {
        opacity: 0;
        transform: translateY(6px);
    }

    /* Click/tap "scratch" delight: bars speed up, mark pops. */
    .keekii-loader.is-scratched {
        --keekii-eq-speed: 220ms;
    }

    .keekii-loader.is-scratched .keekii-loader__mark {
        animation: keekii-loader-pop 620ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* Visually hidden, for screen readers only. */
    .keekii-loader__sr {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
    }

    @keyframes keekii-loader-reveal {
        to {
            opacity: 1;
        }
    }

    @keyframes keekii-loader-drift {
        from {
            transform: translate3d(-2%, -1%, 0) scale(1);
        }
        to {
            transform: translate3d(2%, 2%, 0) scale(1.08);
        }
    }

    @keyframes keekii-loader-eq {
        from {
            transform: scaleY(0.3);
        }
        to {
            transform: scaleY(1);
        }
    }

    @keyframes keekii-loader-mark-bar {
        0%,
        100% {
            transform: scaleY(1);
        }
        50% {
            transform: scaleY(0.55);
        }
    }

    @keyframes keekii-loader-mark-dot {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(22px);
        }
    }

    @keyframes keekii-loader-pop {
        0% {
            transform: scale(1);
        }
        40% {
            transform: scale(1.16) rotate(-4deg);
        }
        100% {
            transform: scale(1);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .keekii-loader {
            opacity: 1;
            animation: none;
        }

        .keekii-loader__glow,
        .keekii-loader__bar,
        .keekii-loader__mark-bar,
        .keekii-loader__mark-dot {
            animation: none;
            transform: none;
        }

        .keekii-loader.is-scratched .keekii-loader__mark {
            animation: none;
        }

        .keekii-loader__copy {
            transition: none;
        }
    }
</style>

{{-- Deliberately NOT carrying the legacy `global-spinner` class.

     resources/views/app.blade.php (the live view, via view('app')) runs:
         setTimeout(function () {
             var spinner = document.querySelector('.global-spinner');
             if (spinner) spinner.style.display = 'flex';
         }, 100);
     That sets an INLINE style 100ms after load, which beats any class rule.
     With it applied, `display: grid` became `display: flex`, so the glow and
     the stage laid out as a row from the top-left instead of being centred -
     the loader looked broken (most obviously against the dark theme, where
     the mis-placed content sits on a background identical to the app's).

     The loader reveals itself with its own opacity animation above, so it
     needs nothing from that legacy path. Nothing else in the codebase styles
     or targets `.global-spinner`. --}}
<div
    class="keekii-loader"
    role="status"
    data-keekii-loader
>
    <span class="keekii-loader__glow" aria-hidden="true"></span>

    <div class="keekii-loader__stage">
        {{-- Twin Pulse mark. viewBox is the mark's bounding box plus a small
             margin, so the glyph fills the slot instead of sitting inside the
             1024-unit padding of the master file. --}}
        <svg
            class="keekii-loader__mark"
            viewBox="200 135 624 754"
            aria-hidden="true"
            focusable="false"
        >
            <circle
                class="keekii-loader__mark-dot"
                cx="332"
                cy="267"
                r="115"
            />
            <circle
                class="keekii-loader__mark-dot keekii-loader__mark-dot--b"
                cx="692"
                cy="417"
                r="115"
            />
            <rect
                class="keekii-loader__mark-bar"
                x="232"
                y="472"
                width="200"
                height="400"
                rx="60"
            />
            <rect
                class="keekii-loader__mark-bar keekii-loader__mark-bar--b"
                x="592"
                y="622"
                width="200"
                height="250"
                rx="60"
            />
        </svg>

        <span class="keekii-loader__word">{{ $keekiiLoaderName }}</span>

        <div class="keekii-loader__eq" aria-hidden="true">
            @foreach ($keekiiLoaderBars as $keekiiBarIndex => $keekiiBarHeight)
                <span
                    class="keekii-loader__bar"
                    style="--keekii-i: {{ $keekiiBarIndex }}; --keekii-h: {{ $keekiiBarHeight }}"
                ></span>
            @endforeach
        </div>

        <p class="keekii-loader__copy" data-keekii-loader-copy aria-hidden="true">
            Tuning the strings&hellip;
        </p>

        <span class="keekii-loader__sr">Loading {{ $keekiiLoaderName }}&hellip;</span>
    </div>
</div>

<script>
    (function () {
        // This <script> is a sibling of the loader, not a descendant, so it is
        // resolved by its data attribute rather than via currentScript.closest.
        var root = document.querySelector('[data-keekii-loader]');

        if (!root) {
            return;
        }

        var copy = root.querySelector('[data-keekii-loader-copy]');
        var ellipsis = '\u2026';
        var lines = [
            'Tuning the strings' + ellipsis,
            'Warming up the speakers' + ellipsis,
            'Cueing up your next favorite track' + ellipsis,
            'Rolling out the vinyl' + ellipsis,
            'Mixing the next track' + ellipsis,
            'Counting in: one, two, three' + ellipsis,
            'Digging through the crates' + ellipsis,
            'Pressing play' + ellipsis,
        ];
        var scratchLines = [
            'Ooh, nice arms' + ellipsis,
            'Scratch that' + ellipsis,
            'Drop the needle' + ellipsis,
        ];

        var reduceMotion =
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var index = 0;
        var scratchIndex = 0;
        var swapTimer = null;
        var scratchTimer = null;
        var rotateTimer = null;

        function show(text) {
            if (!copy) {
                return;
            }
            copy.classList.add('is-swapping');
            clearTimeout(swapTimer);
            swapTimer = setTimeout(function () {
                copy.textContent = text;
                copy.classList.remove('is-swapping');
            }, reduceMotion ? 0 : 190);
        }

        // The loader is removed from the DOM when React mounts into #root, so
        // every timer must bail out once its node is detached.
        function isGone() {
            return !root.isConnected;
        }

        if (copy && !reduceMotion) {
            rotateTimer = setInterval(function () {
                if (isGone()) {
                    clearInterval(rotateTimer);
                    return;
                }
                index = (index + 1) % lines.length;
                show(lines[index]);
            }, 2600);
        }

        // Lightweight interaction: tap/click to "scratch" the record.
        root.addEventListener('click', function () {
            if (isGone()) {
                return;
            }

            root.classList.add('is-scratched');
            clearTimeout(scratchTimer);
            scratchTimer = setTimeout(function () {
                root.classList.remove('is-scratched');
            }, 700);

            if (!copy) {
                return;
            }

            scratchIndex = (scratchIndex + 1) % scratchLines.length;
            show(scratchLines[scratchIndex]);
        });
    })();
</script>
