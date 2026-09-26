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
import {ComponentType, useContext} from 'react';

export type HeroWithBackgroundImageConfig = BaseHeroConfig & {
  name: 'hero-with-background-image';
};

type Props = {
  config: HeroWithBackgroundImageConfig;
};
export function HeroWithBackgroundImage({config}: Props) {
  const {heroSearchBarSlot} = useContext(LandingPageContext);
  const SearchBarCmp = config.showSearchBarSlot
    ? (heroSearchBarSlot ?? null)
    : null;
  const siteIsInDarkMode = useIsDarkMode();
  const isDarkMode = Boolean(siteIsInDarkMode || config.forceDarkMode);
  const variant = config.variant ?? 'spotlight';

  return (
    <div
      className={clsx(
        'overflow-hidden bg-muted text-foreground',
        config.showAsPanel && 'm-2 rounded-3xl',
        config.forceDarkMode && 'dark',
      )}
    >
      {variant === 'spotlight' ? (
        <SpotlightHero config={config} SearchBarCmp={SearchBarCmp} isDarkMode={isDarkMode} />
      ) : (
        <ClassicHero config={config} SearchBarCmp={SearchBarCmp} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

type HeroContentProps = {
  config: HeroWithBackgroundImageConfig;
  SearchBarCmp: ComponentType<{background?: string; config: BaseHeroConfig}> | null;
  isDarkMode: boolean;
};

/**
 * `spotlight` — dark cinematic hero used across the redesign. A full-bleed photo
 * under a scrim, a soft brand glow behind the content and a big headline with the
 * search bar front and center. The bottom fade blends the hero into the next
 * section so the page feels continuous.
 */
function SpotlightHero({config, SearchBarCmp, isDarkMode}: HeroContentProps) {
  return (
    <>
      <SectionNav mode="floating" isDarkMode={isDarkMode} />
      <div className="relative isolate overflow-hidden">
        {config.image ? (
          <>
            <img
              alt=""
              src={config.image.src}
              width={config.image.width}
              height={config.image.height}
              className="absolute inset-0 -z-30 size-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-linear-to-b from-black/75 via-black/40 to-background"
            />
          </>
        ) : (
          <>
            {config.bgColors ? <BgColors config={config} /> : null}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-linear-to-b from-primary/20 via-primary/10 to-background"
            />
          </>
        )}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -z-10 size-72 -translate-x-1/2 -translate-y-[45%] rounded-full bg-primary/25 blur-3xl"
        />
        {config.image ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-background via-transparent to-transparent opacity-90"
          />
        ) : null}

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl pt-36 pb-28 text-center sm:pt-44 sm:pb-36">
            {config.badge ? (
              <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm/6 text-white backdrop-blur-sm">
                <Trans message={config.badge} />
              </div>
            ) : null}
            {config.title ? (
              <Heading className="mt-8">
                <Trans message={config.title} />
              </Heading>
            ) : null}
            {config.description ? (
              <Description className="mt-6">
                <Trans message={config.description} />
              </Description>
            ) : null}
            {SearchBarCmp ? (
              <div className="light mt-10 pb-12.5 text-muted-foreground">
                <SearchBarCmp background="bg-white/95" config={config} />
              </div>
            ) : null}
            {config.buttons?.length ? (
              <Buttons
                buttons={config.buttons}
                className="mt-10 justify-center gap-x-5"
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * `classic` — the previous rendering with clipped color polygons. Kept as a stable
 * alternative for installs that prefer the original look.
 */
function ClassicHero({config, SearchBarCmp, isDarkMode}: HeroContentProps) {
  return (
    <>
      <SectionNav mode="floating" isDarkMode={isDarkMode} />
      <div className="relative isolate overflow-hidden pt-14">
        {config.image ? (
          <img
            alt=""
            src={config.image?.src}
            width={config.image?.width}
            height={config.image?.height}
            className="absolute inset-0 -z-20 size-full object-cover"
          />
        ) : null}
        {config.bgColors ? <BgColors config={config} /> : null}
        <TopPolygon />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className={clsx(
              'mx-auto max-w-2xl',
              SearchBarCmp ? 'py-32 sm:py-36' : 'py-32 sm:py-48 lg:py-56',
            )}
          >
            {config.badge ? (
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full border px-3 py-1 text-sm/6">
                  <Trans message={config.badge} />
                </div>
              </div>
            ) : null}
            <div className="text-center">
              {config.title ? (
                <Heading>
                  <Trans message={config.title} />
                </Heading>
              ) : null}
              {config.description ? (
                <Description className="mt-8">
                  <Trans message={config.description} />
                </Description>
              ) : null}
              {SearchBarCmp ? (
                <div className="light mt-10 pb-12.5 text-muted-foreground">
                  <SearchBarCmp background="bg-white" config={config} />
                </div>
              ) : null}
              {config.buttons?.length ? (
                <Buttons
                  buttons={config.buttons}
                  className="mt-10 justify-center gap-x-6"
                />
              ) : null}
            </div>
          </div>
        </div>
        <BottomPolygon />
      </div>
    </>
  );
}

function TopPolygon() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
    >
      <div
        style={{
          clipPath:
            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
        }}
        className="relative left-[calc(50%-11rem)] aspect-1155/678 w-145 -translate-x-1/2 rotate-30 bg-linear-to-tr from-primary/25 to-primary opacity-25 sm:left-[calc(50%-30rem)] sm:w-237.5"
      />
    </div>
  );
}

function BottomPolygon() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
    >
      <div
        style={{
          clipPath:
            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
        }}
        className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-primary/25 to-primary opacity-25 sm:left-[calc(50%+36rem)] sm:w-288.5"
      />
    </div>
  );
}