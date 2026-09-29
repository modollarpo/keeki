import {BaseHeroConfig} from '@common/ui/landing-page/hero/base-hero-config';
import {
  BgColors,
  Buttons,
  Description,
  Heading,
} from '@common/ui/landing-page/hero/shared';
import {SectionNav} from '@common/ui/landing-page/hero/section-nav';
import {LandingPageContext} from '@common/ui/landing-page/landing-page-context';
import {Trans} from '@ui/i18n/trans';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import clsx from 'clsx';
import {useContext} from 'react';
import {AppSectionConfig} from '@common/ui/landing-page/landing-page-config';

export type KeekiiHeroConfig = BaseHeroConfig & {
  name: 'hero-with-background-image';
};

type Props = {
  config: AppSectionConfig;
  index: number;
};

export function KeekiiHero({config}: Props) {
  const heroConfig = config as KeekiiHeroConfig;
  const {heroSearchBarSlot} = useContext(LandingPageContext);
  const SearchBarCmp = heroConfig.showSearchBarSlot
    ? (heroSearchBarSlot ?? null)
    : null;
  const siteIsInDarkMode = useIsDarkMode();
  const isDarkMode = Boolean(siteIsInDarkMode || heroConfig.forceDarkMode);

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-muted text-foreground',
        heroConfig.showAsPanel && 'm-2 sm:m-4 rounded-[2rem]',
        heroConfig.forceDarkMode && 'dark',
      )}
    >
      <SectionNav mode="floating" isDarkMode={isDarkMode} />
      <div className="relative isolate overflow-hidden">
        {heroConfig.image ? (
          <>
            <img
              alt=""
              src={heroConfig.image.src}
              width={heroConfig.image.width}
              height={heroConfig.image.height}
              className="absolute inset-0 -z-30 size-full object-cover"
              fetchpriority="high"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-linear-to-b from-black/80 via-black/50 to-background"
            />
          </>
        ) : (
          <>
            {heroConfig.bgColors ? <BgColors config={heroConfig} /> : null}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-linear-to-b from-background/40 via-background/60 to-background"
            />
          </>
        )}
        
        {/* Keekii Brand Wash (defined in keekii-brand.css) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 keekii-hero-wash opacity-70"
        />

        {/* Enterprise-Grade Animated Waveform Motif */}
        <div className="absolute inset-x-0 top-[15%] sm:top-[20%] -z-10 flex justify-center opacity-40 mix-blend-screen pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1000 400" className="w-full max-w-[1200px] h-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="hero-pulse-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--be-brand-ink, #e8611f)" />
                <stop offset="100%" stopColor="var(--be-brand-ink-alt, #f0864a)" />
              </linearGradient>
              <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <style>{`
              .bar-anim { animation: equalize 2s ease-in-out infinite alternate; }
              @keyframes equalize {
                0% { transform: scaleY(0.4); }
                100% { transform: scaleY(1); }
              }
            `}</style>
            
            <g fill="url(#hero-pulse-grad)" filter="url(#hero-glow)" className="transform-origin-center" style={{transformOrigin: '50% 50%'}}>
              {/* Symmetrical Twin-Pulse Waveform */}
              <rect x="380" y="160" width="10" height="80" rx="5" className="bar-anim" style={{animationDuration: '1.4s', animationDelay: '0.1s'}} />
              <rect x="410" y="140" width="10" height="120" rx="5" className="bar-anim" style={{animationDuration: '1.7s', animationDelay: '0.4s'}} />
              <rect x="440" y="100" width="10" height="200" rx="5" className="bar-anim" style={{animationDuration: '1.3s', animationDelay: '0.2s'}} />
              <rect x="470" y="60"  width="12" height="280" rx="6" className="bar-anim" style={{animationDuration: '1.9s', animationDelay: '0.5s'}} />
              
              {/* Twin 'i' center peaks */}
              <rect x="500" y="40"  width="14" height="320" rx="7" className="bar-anim" style={{animationDuration: '1.5s', animationDelay: '0.0s'}} />
              <rect x="530" y="60"  width="12" height="280" rx="6" className="bar-anim" style={{animationDuration: '2.1s', animationDelay: '0.3s'}} />
              
              <rect x="560" y="100" width="10" height="200" rx="5" className="bar-anim" style={{animationDuration: '1.4s', animationDelay: '0.6s'}} />
              <rect x="590" y="140" width="10" height="120" rx="5" className="bar-anim" style={{animationDuration: '1.8s', animationDelay: '0.1s'}} />
              <rect x="620" y="160" width="10" height="80" rx="5" className="bar-anim" style={{animationDuration: '1.6s', animationDelay: '0.4s'}} />
            </g>
          </svg>
        </div>

        {heroConfig.image ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/80 to-transparent opacity-100"
          />
        ) : null}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl pt-28 pb-20 sm:pt-40 sm:pb-32 text-center keekii-enter">
            {heroConfig.badge ? (
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs sm:text-sm/6 text-white backdrop-blur-md shadow-2xl transition-transform hover:scale-105">
                <span className="w-2 h-2 rounded-full bg-[var(--be-brand-ink)] mr-2 animate-pulse" />
                <Trans message={heroConfig.badge} />
              </div>
            ) : null}
            {heroConfig.title ? (
              <Heading className="mt-8 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight keekii-display">
                <Trans message={heroConfig.title} />
              </Heading>
            ) : null}
            {heroConfig.description ? (
              <Description className="mt-6 font-medium text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                <Trans message={heroConfig.description} />
              </Description>
            ) : null}
            {SearchBarCmp ? (
              <div className="light mt-8 sm:mt-12 pb-8 sm:pb-12 text-muted-foreground transition-all hover:scale-[1.01] duration-500">
                <SearchBarCmp background="bg-white/95 backdrop-blur-xl shadow-2xl" config={heroConfig} />
              </div>
            ) : null}
            {heroConfig.buttons?.length ? (
              <Buttons
                buttons={heroConfig.buttons}
                className="mt-6 sm:mt-10 justify-center gap-x-4 gap-y-4 flex-col sm:flex-row"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
