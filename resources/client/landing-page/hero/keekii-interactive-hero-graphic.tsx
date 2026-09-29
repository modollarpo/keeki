import {useState} from 'react';

export function KeekiiInteractiveHeroGraphic() {
  const [hovered, setHovered] = useState(false);

  const eqBars = [
    {x: 169, baseH: 30, dur: '1.2s', delay: '0s'},
    {x: 184, baseH: 55, dur: '1.6s', delay: '0.15s'},
    {x: 199, baseH: 75, dur: '1.1s', delay: '0.05s'},
    {x: 214, baseH: 55, dur: '1.8s', delay: '0.25s'},
    {x: 229, baseH: 30, dur: '1.4s', delay: '0.1s'},
  ];

  return (
    <div
      className="mt-14 sm:mt-20 flex justify-center w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer glow ring */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-700 blur-3xl"
          style={{
            backgroundColor: 'var(--be-brand-ink, #e8611f)',
            opacity: hovered ? 0.55 : 0.18,
          }}
        />

        <svg
          viewBox="0 0 400 400"
          className="relative z-10 w-56 h-56 sm:w-72 sm:h-72 cursor-pointer drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: hovered
              ? 'perspective(800px) rotateY(14deg) rotateX(8deg) scale(1.06)'
              : 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.4, 0.64, 1)',
          }}
        >
          <defs>
            <linearGradient id="ihg-disc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c2c30" />
              <stop offset="60%" stopColor="#181819" />
              <stop offset="100%" stopColor="#0c0c0d" />
            </linearGradient>

            <linearGradient id="ihg-brand" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--be-brand-ink-alt, #f0864a)" />
              <stop offset="100%" stopColor="var(--be-brand-ink, #e8611f)" />
            </linearGradient>

            <linearGradient id="ihg-shine" x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            <filter id="ihg-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <style>{`
              @keyframes ihg-eq {
                0%   { transform: scaleY(0.35); }
                100% { transform: scaleY(1); }
              }
              .ihg-bar {
                transform-box: fill-box;
                transform-origin: 50% 100%;
                animation: ihg-eq var(--dur) ease-in-out var(--delay) infinite alternate;
              }
              @media (prefers-reduced-motion: reduce) {
                .ihg-bar { animation: none; }
              }
            `}</style>
          </defs>

          {/* ── Vinyl disc body ── */}
          <circle cx="200" cy="200" r="182" fill="url(#ihg-disc)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

          {/* Grooves */}
          {[158, 138, 118, 100].map(r => (
            <circle key={r} cx="200" cy="200" r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1.2" />
          ))}

          {/* ── Inner brand label ── */}
          <circle cx="200" cy="200" r="68" fill="url(#ihg-brand)" />

          {/* ── Center hole ── */}
          <circle cx="200" cy="200" r="9" fill="#111" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

          {/* ── Interactive center element ── */}
          {hovered ? (
            /* Equalizer bars when hovered */
            <g filter="url(#ihg-glow)">
              {eqBars.map((bar, i) => {
                const h = bar.baseH;
                const y = 200 + 37 - h; // pin bars to baseline y=237
                return (
                  <rect
                    key={i}
                    className="ihg-bar"
                    x={bar.x}
                    y={y}
                    width="11"
                    height={h}
                    rx="5.5"
                    fill="#fff"
                    style={
                      {
                        '--dur': bar.dur,
                        '--delay': bar.delay,
                      } as React.CSSProperties
                    }
                  />
                );
              })}
            </g>
          ) : (
            /* Play triangle when idle */
            <path
              d="M184 170 L184 230 L232 200 Z"
              fill="#fff"
              opacity="0.95"
              style={{filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))'}}
            />
          )}

          {/* Shine half-arc */}
          <ellipse
            cx="170"
            cy="155"
            rx="95"
            ry="60"
            fill="url(#ihg-shine)"
            style={{
              opacity: hovered ? 0.7 : 0.35,
              transition: 'opacity 0.6s',
            }}
          />
        </svg>
      </div>
    </div>
  );
}
