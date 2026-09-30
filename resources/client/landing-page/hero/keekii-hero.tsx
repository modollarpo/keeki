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
import {KeekiiInteractiveHeroGraphic} from './keekii-interactive-hero-graphic';

export type KeekiiHeroConfig = BaseHeroConfig & {
  // Must NOT be 'hero-with-background-image'. That name is in the shared
  // registry (common section-defs.tsx), and the dispatcher in the common
  // landing-page checks that registry first, so the shared HeroWithBackgroundImage
  // would always win and this renderer would never be reached. App-registered
  // sections are only dispatched when their name is absent from the registry.
  name: 'keekii-hero';
};

type Props = {
  config: AppSectionConfig;
  index: number;
};

// Waveform bar data — defined as a typed tuple to satisfy TSC.
const WAVE_BARS: Array<{x: number; y: number; w: number; h: number; rx: number; dur: string; del: string}> = [
  {x: 380, y: 160, w: 10, h: 80,  rx: 5, dur: '1.4s', del: '0.1s'},
  {x: 410, y: 140, w: 10, h: 120, rx: 5, dur: '1.7s', del: '0.4s'},
  {x: 440, y: 100, w: 10, h: 200, rx: 5, dur: '1.3s', del: '0.2s'},
  {x: 470, y: 60,  w: 12, h: 280, rx: 6, dur: '1.9s', del: '0.5s'},
  {x: 500, y: 40,  w: 14, h: 320, rx: 7, dur: '1.5s', del: '0.0s'},
  {x: 530, y: 60,  w: 12, h: 280, rx: 6, dur: '2.1s', del: '0.3s'},
  {x: 560, y: 100, w: 10, h: 200, rx: 5, dur: '1.4s', del: '0.6s'},
  {x: 590, y: 140, w: 10, h: 120, rx: 5, dur: '1.8s', del: '0.1s'},
  {x: 620, y: 160, w: 10, h: 80,  rx: 5, dur: '1.6s', del: '0.4s'},
];

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
        'relative bg-muted text-foreground',
        heroConfig.showAsPanel && 'm-2 sm:m-4 rounded-[2rem]',
        heroConfig.forceDarkMode && 'dark',
      )}
    >
      <SectionNav mode="floating" isDarkMode={isDarkMode} />

      {/* ── Background layer stack ─────────────────────────────────────────── */}
      <div className="relative isolate overflow-hidden">

        {/* Hero image or colour blobs */}
        {heroConfig.image ? (
          <>
            <img
              alt=""
              src={heroConfig.image.src}
              width={heroConfig.image.width}
              height={heroConfig.image.height}
              className="absolute inset-0 -z-30 size-full object-cover"
              fetchPriority="high"
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

        {/* Keekii brand wash */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 keekii-hero-wash opacity-70" />

        {/* Animated waveform background motif */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[10%] -z-10 flex justify-center opacity-30 mix-blend-screen pointer-events-none"
        >
          <svg viewBox="0 0 1000 400" className="w-full max-w-[1400px] h-auto">
            <defs>
              <linearGradient id="hero-pulse-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--be-brand-ink,#e8611f)" />
                <stop offset="100%" stopColor="var(--be-brand-ink-alt,#f0864a)" />
              </linearGradient>
              <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <style>{`.bar-anim{animation:equalize 2s ease-in-out infinite alternate;transform-origin:bottom}@keyframes equalize{0%{transform:scaleY(.3)}to{transform:scaleY(1)}}`}</style>
            <g fill="url(#hero-pulse-grad)" filter="url(#hero-glow)">
              {WAVE_BARS.map((b, i) => (
                <rect
                  key={i}
                  x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx}
                  className="bar-anim"
                  style={{animationDuration: b.dur, animationDelay: b.del}}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Vignette fade at the bottom when a hero image is present */}
        {heroConfig.image ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/50 to-transparent"
          />
        ) : null}

        {/* ── Two-column content layout ────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div 
            className="pt-24 sm:pt-32 lg:pt-36 pb-16 sm:pb-20"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '4rem'
            }}
          >
            {/* ── Left: text content ──────────────────────────────────────── */}
            <div 
              className="flex-1 min-w-0 text-center lg:text-left mx-auto lg:mx-0 keekii-enter"
              style={{ flexBasis: '50%', minWidth: '320px' }}
            >
              {heroConfig.badge ? (
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs sm:text-sm/6 text-white backdrop-blur-md shadow-2xl transition-transform hover:scale-105">
                  <span className="w-2 h-2 rounded-full bg-[var(--be-brand-ink)] mr-2 animate-pulse" />
                  <Trans message={heroConfig.badge} />
                </div>
              ) : null}

              {heroConfig.title ? (
                <Heading className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight keekii-display">
                  <Trans message={heroConfig.title} />
                </Heading>
              ) : null}

              {heroConfig.description ? (
                <Description className="mt-5 font-medium text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  <Trans message={heroConfig.description} />
                </Description>
              ) : null}

              {SearchBarCmp ? (
                <div className="light mt-8 sm:mt-10 pb-2 text-muted-foreground transition-all hover:scale-[1.01] duration-500">
                  <SearchBarCmp background="bg-white/95 backdrop-blur-xl shadow-2xl" config={heroConfig} />
                </div>
              ) : null}

              {heroConfig.buttons?.length ? (
                <Buttons
                  buttons={heroConfig.buttons}
                  className="mt-6 sm:mt-8 justify-center lg:justify-start gap-x-4 gap-y-3 flex-col sm:flex-row"
                />
              ) : null}
            </div>

            {/* ── Right: interactive graphic ───────────────────────────────── */}
            <div 
              style={{
                flexShrink: 0,
                width: '100%',
                maxWidth: '420px',
                display: 'flex',
                justifyContent: 'center',
                margin: '3rem auto 0 auto'
              }}
            >
              <KeekiiInteractiveHeroGraphic />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
