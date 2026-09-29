import React, { useState } from 'react';

export function KeekiiInteractiveHeroGraphic() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="mt-16 sm:mt-24 mb-4 flex justify-center w-full perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative w-64 h-64 sm:w-80 sm:h-80 transition-all duration-700 ease-out preserve-3d cursor-pointer"
        style={{
          transform: isHovered ? 'rotateY(15deg) rotateX(10deg) scale(1.05)' : 'rotateY(0deg) rotateX(0deg) scale(1)',
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl opacity-30 transition-opacity duration-700"
          style={{ 
            backgroundColor: 'var(--be-brand-ink, #e8611f)',
            opacity: isHovered ? 0.6 : 0.2 
          }}
        />
        
        {/* The SVG Graphic */}
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full relative z-10 drop-shadow-2xl"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="discGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a2d" />
              <stop offset="50%" stopColor="#1a1a1c" />
              <stop offset="100%" stopColor="#0a0a0b" />
            </linearGradient>
            
            <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>

            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--be-brand-ink-alt, #f0864a)" />
              <stop offset="100%" stopColor="var(--be-brand-ink, #e8611f)" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Outer Record Rim */}
          <circle cx="200" cy="200" r="180" fill="url(#discGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <circle cx="200" cy="200" r="176" fill="transparent" stroke="url(#highlightGrad)" strokeWidth="1" />
          
          {/* Grooves */}
          <circle cx="200" cy="200" r="150" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx="200" cy="200" r="130" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="110" fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="200" cy="200" r="90" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

          {/* Inner Brand Label */}
          <circle cx="200" cy="200" r="65" fill="url(#brandGrad)" />
          
          {/* Center Hole */}
          <circle cx="200" cy="200" r="8" fill="#111" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

          {/* Dynamic Play/Equalizer Element that reacts to hover */}
          <g style={{ transformOrigin: '200px 200px', transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {isHovered ? (
              <g filter="url(#glow)">
                {/* Equalizer Bars */}
                <rect x="175" y="185" width="8" height="30" rx="4" fill="#fff" className="animate-[equalize_1.2s_ease-in-out_infinite_alternate]" />
                <rect x="190" y="170" width="8" height="60" rx="4" fill="#fff" className="animate-[equalize_1.5s_ease-in-out_infinite_alternate_0.2s]" />
                <rect x="205" y="180" width="8" height="40" rx="4" fill="#fff" className="animate-[equalize_1.1s_ease-in-out_infinite_alternate_0.4s]" />
                <rect x="220" y="190" width="8" height="20" rx="4" fill="#fff" className="animate-[equalize_1.3s_ease-in-out_infinite_alternate_0.1s]" />
              </g>
            ) : (
              {/* Play Button Triangle */}
              <path d="M185 170 L185 230 L230 200 Z" fill="#fff" filter="url(#glow)" />
            )}
          </g>

          {/* Shine overlay */}
          <path d="M 20,200 A 180,180 0 0,1 380,200 A 180,180 0 0,0 20,200 Z" fill="url(#highlightGrad)" style={{ transformOrigin: '200px 200px', transform: 'rotate(-45deg)', opacity: isHovered ? 0.8 : 0.4, transition: 'opacity 0.7s' }} />
        </svg>
      </div>
    </div>
  );
}
