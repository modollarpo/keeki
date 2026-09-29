import {useState} from 'react';

// Equaliser bar heights (as % of container, 8–88 range)
const EQ_BARS: number[] = [28, 55, 42, 78, 52, 88, 38, 68, 48, 82, 32, 62, 72];

/**
 * KeekiiInteractiveHeroGraphic
 *
 * Self-contained interactive music-player card for the hero right column.
 * Uses solid opaque background so it is visible on any hero image or gradient.
 * Click / Enter toggles the play state.
 */
export function KeekiiInteractiveHeroGraphic() {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="w-full max-w-sm cursor-pointer select-none rounded-3xl"
      role="button"
      tabIndex={0}
      aria-label={playing ? 'Pause preview' : 'Play preview'}
      onClick={() => setPlaying(p => !p)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setPlaying(p => !p);
        }
      }}
      style={{
        background: 'linear-gradient(145deg, #1c110a 0%, #110a04 55%, #1e120c 100%)',
        boxShadow:
          '0 0 0 1.5px rgba(232,97,31,0.30),' +
          '0 0 60px rgba(232,97,31,0.22),' +
          '0 24px 80px rgba(0,0,0,0.65)',
      }}
    >
      {/* Inline keyframes */}
      <style>{`
        @keyframes ihg-eq {
          from { transform: scaleY(0.15); }
          to   { transform: scaleY(1); }
        }
        @keyframes ihg-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ihg-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
      `}</style>

      {/* Top accent line */}
      <div
        className="rounded-t-3xl h-[2px]"
        style={{
          background:
            'linear-gradient(90deg,transparent,var(--be-brand-ink,#e8611f) 30%,var(--be-brand-ink-alt,#f0864a) 70%,transparent)',
        }}
      />

      {/* Ambient glow layer */}
      <div className="relative overflow-hidden rounded-b-3xl">
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{background: 'radial-gradient(circle,rgba(232,97,31,.18) 0%,transparent 65%)'}}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full pointer-events-none"
          style={{background: 'radial-gradient(circle,rgba(240,134,74,.12) 0%,transparent 65%)'}}
        />

        <div className="relative z-10 p-5">

          {/* ── Track header ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-5">

            {/* Album art with vinyl spin */}
            <div
              className="w-14 h-14 rounded-2xl shrink-0 relative overflow-hidden flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg,var(--be-brand-ink,#e8611f),var(--be-brand-ink-alt,#f0864a))',
                boxShadow: playing
                  ? '0 0 24px rgba(232,97,31,.6)'
                  : '0 4px 16px rgba(232,97,31,.35)',
                transition: 'box-shadow 0.4s',
              }}
            >
              {/* Spinning vinyl ring (visible while playing) */}
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  animation: playing ? 'ihg-spin 3.5s linear infinite' : 'none',
                  opacity: playing ? 1 : 0,
                  transition: 'opacity 0.3s',
                }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-white/25 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                </div>
              </div>
              {/* Music note icon (visible while paused) */}
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="white"
                style={{
                  opacity: playing ? 0 : 1,
                  transition: 'opacity 0.3s',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.4))',
                }}
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>

            {/* Track info */}
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm leading-tight truncate">Keekii Radio</p>
              <p className="text-white/50 text-xs mt-0.5 truncate">Stream · Discover · Vibe</p>
            </div>

            {/* Status badge */}
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0"
              style={{
                background: playing ? 'rgba(34,197,94,.15)' : 'rgba(232,97,31,.15)',
                border: playing ? '1px solid rgba(34,197,94,.4)' : '1px solid rgba(232,97,31,.4)',
                transition: 'all 0.4s',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: playing ? '#22c55e' : 'var(--be-brand-ink,#e8611f)',
                  animation: 'ihg-pulse 1.5s ease-in-out infinite',
                }}
              />
              <span
                className="text-xs font-semibold tracking-wide"
                style={{color: playing ? '#22c55e' : 'var(--be-brand-ink-alt,#f0864a)'}}
              >
                {playing ? 'PLAYING' : 'LIVE'}
              </span>
            </div>
          </div>

          {/* ── Equaliser visualiser ───────────────────────────────────── */}
          <div
            className="flex items-end justify-center gap-[3px] rounded-xl px-3 mb-4"
            style={{
              height: '64px',
              background: 'rgba(255,255,255,.035)',
              border: '1px solid rgba(255,255,255,.07)',
            }}
          >
            {EQ_BARS.map((h, i) => (
              <div
                key={i}
                className="rounded-full flex-1"
                style={{
                  minWidth: '5px',
                  height: playing ? `${h}%` : `${Math.max(8, Math.round(h * 0.22))}%`,
                  background:
                    'linear-gradient(to top,var(--be-brand-ink,#e8611f),var(--be-brand-ink-alt,#f0864a))',
                  opacity: playing ? 1 : 0.3,
                  transition: 'height 0.18s ease, opacity 0.4s',
                  animation: playing
                    ? `ihg-eq ${(0.5 + (i % 5) * 0.18).toFixed(2)}s ease-in-out ${(i * 0.06).toFixed(2)}s infinite alternate`
                    : 'none',
                  transformOrigin: 'bottom',
                }}
              />
            ))}
          </div>

          {/* ── Progress bar ──────────────────────────────────────────── */}
          <div
            className="h-1 rounded-full mb-5"
            style={{background: 'rgba(255,255,255,.1)'}}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: playing ? '58%' : '0%',
                background:
                  'linear-gradient(90deg,var(--be-brand-ink,#e8611f),var(--be-brand-ink-alt,#f0864a))',
                transition: 'width 0.5s ease-out',
              }}
            />
          </div>

          {/* ── Transport controls ────────────────────────────────────── */}
          <div className="flex items-center justify-between">

            {/* Prev */}
            <button
              type="button"
              aria-label="Previous"
              className="rounded-full p-2.5 transition-all active:scale-90 hover:opacity-80"
              style={{background: 'rgba(255,255,255,.07)'}}
              onClick={e => e.stopPropagation()}
            >
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,.65)">
                <path d="M19 20L9 12l10-8v16zM5 4h2v16H5z" />
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              aria-label={playing ? 'Pause' : 'Play'}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{
                background:
                  'linear-gradient(135deg,var(--be-brand-ink,#e8611f),var(--be-brand-ink-alt,#f0864a))',
                boxShadow: playing
                  ? '0 0 32px rgba(232,97,31,.75),0 0 12px rgba(232,97,31,.4)'
                  : '0 0 20px rgba(232,97,31,.4)',
                transition: 'box-shadow 0.3s',
              }}
            >
              {playing ? (
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1.5" />
                  <rect x="14" y="4" width="4" height="16" rx="1.5" />
                </svg>
              ) : (
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="white" style={{marginLeft: '2px'}}>
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              aria-label="Next"
              className="rounded-full p-2.5 transition-all active:scale-90 hover:opacity-80"
              style={{background: 'rgba(255,255,255,.07)'}}
              onClick={e => e.stopPropagation()}
            >
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,.65)">
                <path d="M5 4l10 8-10 8V4zM19 4h-2v16h2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
