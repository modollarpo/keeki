import {ConfigIcon, ConfigIconWithBg} from '@common/ui/landing-page/config-icon';
import {SectionPresentation} from '@common/ui/landing-page/landing-page-config';
import {SectionHeading} from '@common/ui/landing-page/primitives/section-heading';
import {Trans} from '@ui/i18n/trans';
import {IconTree} from '@ui/icons/create-svg-icon';
import {cn} from '@ui/utils/cn';
import {AppSectionConfig} from '@common/ui/landing-page/landing-page-config';

export type KeekiiFeatureWithSvgConfig = SectionPresentation & {
  name: 'keekii-feature-with-svg';
  title: string;
  badge: string;
  description: string;
  svgIllustration?: 'artist' | 'listener' | 'engagement';
  alignLeft?: boolean;
  inPanel?: boolean;
  forceDarkMode?: boolean;
  wrapIconsInBg?: boolean;
  features: {
    title: string;
    description: string;
    icon?: string | IconTree[];
  }[];
};

type Props = {
  config: AppSectionConfig;
  index: number;
};

export function KeekiiFeatureWithSvg({config: baseConfig}: Props) {
  const config = baseConfig as KeekiiFeatureWithSvgConfig;
  const isSmallPanel = config.inPanel;
  const panelClassName =
    'overflow-hidden border border-border/80 bg-muted/40 dark:bg-card py-20 sm:rounded-[2.5rem] sm:py-24 lg:py-24 isolate shadow-2xl';

  return (
    <div
      className={cn(
        'overflow-hidden',
        spacingClasses[config.spacing ?? 'default'],
        config.forceDarkMode && 'dark',
        !config.inPanel && 'bg',
      )}
    >
      <section className={cn(isSmallPanel && 'mx-2 sm:mx-6')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              'relative',
              isSmallPanel && panelClassName,
              isSmallPanel && 'px-4 sm:px-10 xl:px-24',
            )}
          >
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
              
              {/* Text side - order-2 on mobile, responsive align on desktop */}
              <div
                className={cn(
                  "flex flex-col justify-center order-2",
                  config.alignLeft ? 'lg:order-2 lg:pl-12 xl:pl-20' : 'lg:order-1 lg:pr-12 xl:pr-20',
                )}
              >
                <div className="lg:max-w-lg">
                  <SectionHeading
                    badge={config.badge}
                    title={config.title}
                    description={config.description}
                    align={config.align ?? 'left'}
                  />
                  <div className="mt-8 sm:mt-12 max-w-xl space-y-8 text-base/7 text-muted-foreground lg:max-w-none">
                    {config.features?.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-x-4.5"
                      >
                        {feature.icon ? (
                          config.wrapIconsInBg ? (
                            <ConfigIconWithBg icon={feature.icon} />
                          ) : (
                            <ConfigIcon
                              icon={feature.icon}
                              className="mt-1 size-5 text-primary"
                            />
                          )
                        ) : null}
                        <div>
                          <div className="font-semibold text-foreground text-lg mb-1">
                            <Trans message={feature.title} />
                          </div>
                          <div className="leading-relaxed opacity-90">
                            <Trans message={feature.description} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SVG Illustration Container - order-1 on mobile so it's always on top, responsive on desktop */}
              <div
                className={cn(
                  'flex items-center justify-center p-0 sm:p-4 md:p-8 order-1',
                  config.alignLeft ? 'lg:order-1' : 'lg:order-2'
                )}
              >
                <div className="w-full max-w-lg relative">
                  <Illustration type={config.svgIllustration} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const spacingClasses = {
  compact: 'py-16 sm:py-20',
  default: 'py-20 sm:py-32',
  spacious: 'py-28 sm:py-40',
};

function Illustration({type}: {type?: 'artist' | 'listener' | 'engagement'}) {
  if (type === 'artist') return <ArtistSvg />;
  if (type === 'listener') return <ListenerSvg />;
  if (type === 'engagement') return <EngagementSvg />;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTERPRISE-GRADE SVG ILLUSTRATIONS
// Uses CSS custom properties (--be-brand-ink, --be-primary) for theming.
// ─────────────────────────────────────────────────────────────────────────────

function ArtistSvg() {
  return (
    <svg viewBox="0 0 600 450" className="w-full h-auto drop-shadow-2xl overflow-visible">
      <defs>
        <linearGradient id="art-grad" x1="0" y1="1" x2="1" y2="0">
           <stop offset="0%" stopColor="var(--be-brand-ink, #e8611f)" stopOpacity="0.2"/>
           <stop offset="100%" stopColor="var(--be-brand-ink-alt, #f0864a)" stopOpacity="0.8"/>
        </linearGradient>
        <filter id="art-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <style>{`
        @keyframes draw-line {
          from { stroke-dashoffset: 1200; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Base Glass Card */}
      <rect x="50" y="80" width="500" height="320" rx="24" fill="currentColor" className="text-card/60 backdrop-blur-3xl" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      
      {/* Grid Lines */}
      <path d="M 50 160 L 550 160 M 50 240 L 550 240 M 50 320 L 550 320" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />
      
      {/* Abstract Waveform Bars in background */}
      <g fill="currentColor" className="text-muted-foreground" opacity="0.1">
        <rect x="100" y="280" width="16" height="40" rx="4" />
        <rect x="140" y="240" width="16" height="80" rx="4" />
        <rect x="180" y="160" width="16" height="160" rx="4" />
        <rect x="220" y="200" width="16" height="120" rx="4" />
        <rect x="260" y="100" width="16" height="220" rx="4" />
        <rect x="300" y="140" width="16" height="180" rx="4" />
      </g>

      {/* Trend Area Fill */}
      <path d="M 50 400 L 120 340 L 220 360 L 380 180 L 550 220 L 550 400 Z" fill="url(#art-grad)" opacity="0.3" />
      
      {/* Glowing Trend Line */}
      <path 
        d="M 50 400 L 120 340 L 220 360 L 380 180 L 550 220" 
        fill="none" 
        stroke="var(--be-brand-ink, #e8611f)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#art-glow)" 
        className="animate-[draw-line_3s_ease-out_forwards]" 
        strokeDasharray="1200" 
      />
      <path 
        d="M 50 400 L 120 340 L 220 360 L 380 180 L 550 220" 
        fill="none" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.8"
        className="animate-[draw-line_3s_ease-out_forwards]" 
        strokeDasharray="1200" 
      />

      {/* Floating Approved / Growth Badge */}
      <g className="animate-[float-badge_4s_ease-in-out_infinite] origin-center" transform="translate(380, 180)">
        <circle cx="0" cy="0" r="32" fill="var(--be-brand-ink, #e8611f)" filter="url(#art-glow)" />
        <circle cx="0" cy="0" r="32" fill="var(--be-brand-ink, #e8611f)" />
        <path d="M -10 2 L -2 10 L 12 -8" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function ListenerSvg() {
  return (
    <svg viewBox="0 0 600 450" className="w-full h-auto drop-shadow-2xl overflow-visible">
      <defs>
         <linearGradient id="list-grad" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stopColor="var(--be-brand-ink, #e8611f)" stopOpacity="0.8"/>
           <stop offset="100%" stopColor="var(--be-brand-ink-alt, #f0864a)" stopOpacity="0.2"/>
        </linearGradient>
        <filter id="list-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Background Pulse */}
      <circle cx="300" cy="225" r="180" fill="url(#list-grad)" opacity="0.3" className="animate-pulse" style={{animationDuration: '6s'}} />
      <circle cx="300" cy="225" r="140" fill="none" stroke="var(--be-brand-ink, #e8611f)" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="8 8" className="animate-spin origin-center" style={{animationDuration: '24s'}} />
      
      {/* Abstract Glass Player Interface */}
      <rect x="120" y="145" width="360" height="160" rx="40" fill="currentColor" className="text-card/70 backdrop-blur-3xl" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      
      {/* Play Button Node */}
      <circle cx="210" cy="225" r="32" fill="var(--be-brand-ink, #e8611f)" filter="url(#list-glow)" />
      <circle cx="210" cy="225" r="32" fill="var(--be-brand-ink, #e8611f)" />
      <path d="M 202 210 L 226 225 L 202 240 Z" fill="white" />
      
      {/* Player Equalizer Waveform */}
      <g fill="currentColor" className="text-foreground" opacity="0.8">
        <rect x="270" y="210" width="8" height="30" rx="4" />
        <rect x="286" y="195" width="8" height="60" rx="4" />
        <rect x="302" y="215" width="8" height="20" rx="4" />
        <rect x="318" y="185" width="8" height="80" rx="4" />
      </g>
      <rect x="334" y="200" width="8" height="50" rx="4" fill="var(--be-brand-ink, #e8611f)" filter="url(#list-glow)" />
      <g fill="currentColor" className="text-foreground" opacity="0.3">
        <rect x="350" y="215" width="8" height="20" rx="4" />
        <rect x="366" y="205" width="8" height="40" rx="4" />
        <rect x="382" y="220" width="8" height="10" rx="4" />
      </g>
      
      {/* Floating Glass Pills (Discovery Nodes) */}
      <g className="animate-bounce" style={{animationDuration: '5s'}}>
        <rect x="380" y="70" width="160" height="48" rx="24" fill="currentColor" className="text-background/90 backdrop-blur-2xl" stroke="currentColor" strokeOpacity="0.1" />
        <circle cx="410" cy="94" r="8" fill="var(--be-brand-ink, #e8611f)" />
        <text x="432" y="99" fill="currentColor" className="text-foreground" fontSize="14" fontWeight="700">New Releases</text>
      </g>
      
      <g className="animate-bounce" style={{animationDuration: '6s', animationDelay: '1s'}}>
        <rect x="60" y="320" width="140" height="48" rx="24" fill="currentColor" className="text-background/90 backdrop-blur-2xl" stroke="currentColor" strokeOpacity="0.1" />
        <circle cx="90" cy="344" r="8" fill="var(--be-brand-ink-alt, #f0864a)" />
        <text x="112" y="349" fill="currentColor" className="text-foreground" fontSize="14" fontWeight="700">Daily Mix</text>
      </g>
    </svg>
  );
}

function EngagementSvg() {
  return (
    <svg viewBox="0 0 600 450" className="w-full h-auto drop-shadow-2xl overflow-visible">
      <defs>
         <linearGradient id="eng-grad" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%" stopColor="var(--be-brand-ink, #e8611f)" stopOpacity="0.9"/>
           <stop offset="100%" stopColor="var(--be-brand-ink-alt, #f0864a)" stopOpacity="0.2"/>
        </linearGradient>
        <filter id="eng-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Animated Connection Curve */}
      <path 
        d="M 120 280 C 250 100, 350 350, 480 180" 
        fill="none" 
        stroke="url(#eng-grad)" 
        strokeWidth="4" 
        strokeDasharray="8 8" 
        className="animate-[dash_10s_linear_infinite]" 
      />
      <style>{`@keyframes dash { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }`}</style>
      
      {/* Artist Node (Left) */}
      <circle cx="120" cy="280" r="56" fill="currentColor" className="text-card/70 backdrop-blur-xl" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <circle cx="120" cy="280" r="40" fill="none" stroke="var(--be-brand-ink, #e8611f)" strokeWidth="3" strokeOpacity="0.5" />
      <circle cx="120" cy="270" r="14" fill="currentColor" className="text-muted-foreground" />
      <path d="M 95 300 Q 120 270 145 300" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="6" strokeLinecap="round" />
      
      {/* Action / Notification Pulse Node (Center) */}
      <g transform="translate(300, 230)">
        <circle cx="0" cy="0" r="72" fill="currentColor" className="text-card/90 backdrop-blur-3xl" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
        <circle cx="0" cy="0" r="88" fill="none" stroke="var(--be-brand-ink, #e8611f)" strokeWidth="2" opacity="0.4" className="animate-ping origin-center" style={{animationDuration: '3s'}} />
        
        {/* Ringing Bell */}
        <g className="animate-pulse origin-top" style={{animationDuration: '1.5s'}}>
          <path d="M -16 -4 C -16 -24, -6 -32, 0 -32 C 6 -32, 16 -24, 16 -4 L 22 4 L -22 4 Z" fill="var(--be-brand-ink, #e8611f)" filter="url(#eng-glow)" />
          <path d="M -16 -4 C -16 -24, -6 -32, 0 -32 C 6 -32, 16 -24, 16 -4 L 22 4 L -22 4 Z" fill="var(--be-brand-ink, #e8611f)" />
          <circle cx="0" cy="10" r="5" fill="var(--be-brand-ink, #e8611f)" />
        </g>
        
        {/* Notification Bubble Popup */}
        <g className="animate-bounce" style={{animationDuration: '2.5s'}}>
          <circle cx="20" cy="-28" r="16" fill="#ef4444" />
          <text x="20" y="-23" fill="white" fontSize="14" fontWeight="800" textAnchor="middle">1</text>
        </g>
      </g>
      
      {/* Listener Node (Right) */}
      <circle cx="480" cy="180" r="48" fill="currentColor" className="text-card/70 backdrop-blur-xl" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <circle cx="480" cy="172" r="12" fill="currentColor" className="text-muted-foreground" />
      <path d="M 460 196 Q 480 172 500 196" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
