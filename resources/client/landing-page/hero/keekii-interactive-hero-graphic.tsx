import {useState} from 'react';

export function KeekiiInteractiveHeroGraphic() {
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  const bars = [40, 70, 55, 90, 65, 80, 45, 75, 60, 85, 50];

  return (
    <div className="w-full flex justify-center pb-16 pt-6">
      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden cursor-pointer select-none"
        style={{boxShadow: '0 8px 64px rgba(232,97,31,0.25), 0 2px 24px rgba(0,0,0,0.4)'}}
        onClick={() => setPlaying(p => !p)}
      >
        {/* Gradient accent strip */}
        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-3xl"
          style={{background: 'linear-gradient(90deg, var(--be-brand-ink,#e8611f), var(--be-brand-ink-alt,#f0864a))'}}
        />

        <div className="p-6">
          {/* Track info */}
          <div className="flex items-center gap-4 mb-6">
            {/* Album art placeholder */}
            <div
              className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center"
              style={{background: 'linear-gradient(135deg, var(--be-brand-ink,#e8611f), var(--be-brand-ink-alt,#f0864a))'}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3" fill="white"/>
                <circle cx="18" cy="16" r="3" fill="white"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">Now Playing</p>
              <p className="text-white/60 text-xs truncate mt-0.5">Keekii Music</p>
            </div>
            {/* Live badge */}
            <div className="ml-auto flex items-center gap-1.5 bg-red-500/20 border border-red-400/40 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-300 text-xs font-medium">LIVE</span>
            </div>
          </div>

          {/* Equalizer bars */}
          <div className="flex items-end justify-center gap-1 h-16 mb-6">
            {bars.map((h, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-150"
                style={{
                  width: '10px',
                  height: playing ? `${h}%` : `${Math.max(15, h * 0.3)}%`,
                  background: active === i
                    ? 'white'
                    : 'linear-gradient(to top, var(--be-brand-ink,#e8611f), var(--be-brand-ink-alt,#f0864a))',
                  animation: playing
                    ? `ihg-eq ${0.6 + (i % 5) * 0.2}s ease-in-out ${i * 0.07}s infinite alternate`
                    : 'none',
                  opacity: playing ? 1 : 0.5,
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button className="text-white/50 hover:text-white transition-colors p-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 20L9 12l10-8v16zM5 4h2v16H5z"/>
              </svg>
            </button>

            {/* Big play button */}
            <button
              className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{background: 'linear-gradient(135deg, var(--be-brand-ink,#e8611f), var(--be-brand-ink-alt,#f0864a))', boxShadow: '0 0 24px rgba(232,97,31,0.5)'}}
            >
              {playing ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{marginLeft: '2px'}}>
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
              )}
            </button>

            <button className="text-white/50 hover:text-white transition-colors p-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 4l10 8-10 8V4zM19 4h-2v16h2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Inline keyframes */}
        <style>{`
          @keyframes ihg-eq {
            from { transform: scaleY(0.3); }
            to   { transform: scaleY(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
