import {useState} from 'react';

export function KeekiiInteractiveHeroGraphic() {
  const [playing, setPlaying] = useState(false);
  const bars = [30, 60, 45, 80, 55, 90, 40, 70, 50, 85, 35, 65, 75];

  return (
    <div className="w-full flex justify-center items-center py-10 px-4">
      <div
        className="relative w-full max-w-md cursor-pointer select-none rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1a1208 0%, #0f0a04 60%, #1e100a 100%)',
          boxShadow:
            '0 0 0 1px rgba(232,97,31,0.25), 0 8px 80px rgba(232,97,31,0.3), 0 2px 32px rgba(0,0,0,0.7)',
        }}
        onClick={() => setPlaying(p => !p)}
        role="button"
        aria-label={playing ? 'Pause' : 'Play'}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setPlaying(p => !p)}
      >
        {/* Brand gradient top strip */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--be-brand-ink,#e8611f), var(--be-brand-ink-alt,#f0864a), transparent)',
          }}
        />

        {/* Ambient glow orbs */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{background: 'radial-gradient(circle, rgba(232,97,31,0.2) 0%, transparent 70%)'}}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
          style={{background: 'radial-gradient(circle, rgba(240,134,74,0.15) 0%, transparent 70%)'}}
        />

        <div className="relative z-10 p-6">
          {/* Header row */}
          <div className="flex items-center gap-4 mb-5">
            {/* Album art */}
            <div
              className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #e8611f 0%, #f0864a 100%)',
                boxShadow: '0 4px 16px rgba(232,97,31,0.45)',
              }}
            >
              {/* Vinyl ring */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{animation: playing ? 'ihg-spin 4s linear infinite' : 'none'}}
              >
                <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                </div>
              </div>
              {/* Music icon on top */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="white"
                className="relative z-10 drop-shadow"
                style={{opacity: playing ? 0 : 1, transition: 'opacity 0.3s'}}
              >
                <path d="M9 18V5l12-2v13" strokeWidth="0" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm leading-tight truncate">Keekii Radio</p>
              <p className="text-white/50 text-xs mt-0.5 truncate">Stream · Discover · Vibe</p>
            </div>

            {/* Live badge */}
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0"
              style={{
                background: playing ? 'rgba(34,197,94,0.15)' : 'rgba(232,97,31,0.15)',
                border: playing ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(232,97,31,0.4)',
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
                className="text-xs font-semibold"
                style={{color: playing ? '#22c55e' : 'var(--be-brand-ink-alt,#f0864a)'}}
              >
                {playing ? 'PLAYING' : 'LIVE'}
              </span>
            </div>
          </div>

          {/* Equalizer visualiser */}
          <div
            className="flex items-end justify-center gap-[3px] mb-5 rounded-2xl p-3"
            style={{
              height: '72px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {bars.map((h, i) => (
              <div
                key={i}
                className="rounded-full flex-1"
                style={{
                  minWidth: '6px',
                  height: playing ? `${h}%` : `${Math.max(10, h * 0.25)}%`,
                  background: `linear-gradient(to top, var(--be-brand-ink,#e8611f), var(--be-brand-ink-alt,#f0864a))`,
                  opacity: playing ? 1 : 0.35,
                  transition: 'height 0.15s ease, opacity 0.4s',
                  animation: playing
                    ? `ihg-eq ${0.55 + (i % 5) * 0.15}s ease-in-out ${i * 0.06}s infinite alternate`
                    : 'none',
                  transformOrigin: 'bottom',
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div
            className="h-1 rounded-full mb-5 overflow-hidden"
            style={{background: 'rgba(255,255,255,0.1)'}}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: playing ? '60%' : '0%',
                background: 'linear-gradient(90deg, var(--be-brand-ink,#e8611f), var(--be-brand-ink-alt,#f0864a))',
                transition: 'width 0.5s ease',
              }}
            />
          </div>

          {/* Transport controls */}
          <div className="flex items-center justify-between">
            <button
              className="rounded-full p-2.5 transition-all active:scale-90"
              style={{background: 'rgba(255,255,255,0.06)'}}
              aria-label="Previous"
              onClick={e => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                <path d="M19 20L9 12l10-8v16zM5 4h2v16H5z" />
              </svg>
            </button>

            {/* Central play/pause */}
            <button
              className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{
                background: 'linear-gradient(135deg, var(--be-brand-ink,#e8611f), var(--be-brand-ink-alt,#f0864a))',
                boxShadow: playing
                  ? '0 0 32px rgba(232,97,31,0.7), 0 0 12px rgba(232,97,31,0.4)'
                  : '0 0 20px rgba(232,97,31,0.4)',
                transition: 'box-shadow 0.3s',
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1.5" />
                  <rect x="14" y="4" width="4" height="16" rx="1.5" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{marginLeft: '2px'}}>
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
            </button>

            <button
              className="rounded-full p-2.5 transition-all active:scale-90"
              style={{background: 'rgba(255,255,255,0.06)'}}
              aria-label="Next"
              onClick={e => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                <path d="M5 4l10 8-10 8V4zM19 4h-2v16h2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Inline keyframes */}
        <style>{`
          @keyframes ihg-eq {
            from { transform: scaleY(0.25); }
            to   { transform: scaleY(1); }
          }
          @keyframes ihg-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes ihg-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
        `}</style>
      </div>
    </div>
  );
}
