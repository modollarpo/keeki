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
        'relative bg-muted text-foreground',
        heroConfig.showAsPanel && 'm-2 sm:m-4 rounded-[2rem]',
        heroConfig.forceDarkMode && 'dark',
      )}
    >
      <SectionNav mode="floating" isDarkMode={isDarkMode} />

      {/* ── Background layer stack ─────────────────────────────────────────── */}
      <div className="relative isolate overflow-hidden">
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
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 keekii-hero-wash opacity-70"
        />

        {/* Animated waveform motif */}
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
            <style>{`
              .bar-anim { animation: equalize 2s ease-in-out infinite alternate; transform-origin: bottom; }
              @keyframes equalize { 0% { transform: scaleY(0.3); } 100% { transform: scaleY(1); } }
            `}</style>
            <g fill="url(#hero-pulse-grad)" filter="url(#hero-glow)">
              {[
                [380, 160, 10, 80, 5, '1.4s', '0.1s'],
                [410, 140, 10, 120, 5, '1.7s', '0.4s'],
                [440, 100, 10, 200, 5, '1.3s', '0.2s'],
                [470, 60, 12, 280, 6, '1.9s', '0.5s'],
                [500, 40, 14, 320, 7, '1.5s', '0.0s'],
                [530, 60, 12, 280, 6, '2.1s', '0.3s'],
                [560, 100, 10, 200, 5, '1.4s', '0.6s'],
                [590, 140, 10, 120, 5, '1.8s', '0.1s'],
                [620, 160, 10, 80, 5, '1.6s', '0.4s'],
              ].map(([x, y, w, h, rx, dur, delay], i) => (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={rx}
                  className="bar-anim"
                  style={{animationDuration: String(dur), animationDelay: String(delay)}}
                />
              ))}
            </g>
          </svg>
        </div>

        {heroConfig.image ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/50 to-transparent"
          />
        ) : null}

        {/* ── Two-column hero layout ───────────────────────────────────────── */}
        {/*                                                                    */}
        {/* Desktop: [text left 55%] [graphic right 45%] side by side         */}
        {/* Mobile:  text stacked on top, graphic below (both full-width)      */}
        {/*                                                                    */}
        {/* The graphic is always in the SAME visual row as the text, so it   */}
        {/* is always above the fold on any viewport ≥ 320 px.                */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 pt-24 sm:pt-32 lg:pt-36 pb-16 sm:pb-20">

            {/* Left column — text content */}
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0 keekii-enter">
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

            {/* Right column — interactive graphic */}
            {/* On mobile this renders below the text, still above the fold   */}
            {/* because the text column is compact without the giant pt-28.   */}
            <div className="mt-10 lg:mt-0 w-full lg:w-auto lg:shrink-0 lg:w-[420px] flex justify-center lg:justify-end">
              <KeekiiInteractiveHeroGraphic />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
