import {AdHost} from '@common/admin/ads/ad-host';
import {useSettingsPreviewMode} from '@common/admin/settings/preview/use-settings-preview-mode';
import {DefaultMetaTags} from '@common/seo/default-meta-tags';
import {HeroSimpleCentered} from '@common/ui/landing-page/hero/hero-simple-centered';
import {HeroSplitWithScreenshot} from '@common/ui/landing-page/hero/hero-split-with-screenshot';
import {HeroWithBackgroundImage} from '@common/ui/landing-page/hero/hero-with-background-image';
import {NormalizedSection} from '@common/ui/landing-page/landing-page-config';
import {LandingPageContext} from '@common/ui/landing-page/landing-page-context';
import {normalizeSections} from '@common/ui/landing-page/normalize/normalize-sections';
import {SectionErrorBoundary} from '@common/ui/landing-page/primitives/section-error-boundary';
import {SectionFallback} from '@common/ui/landing-page/primitives/section-skeleton';
import {isSharedSectionConfig} from '@common/ui/landing-page/section-defs';
import {useLandingSectionViews} from '@common/ui/landing-page/use-landing-section-views';
import {useSettings} from '@ui/settings/use-settings';
import {
  lazy,
  ReactNode,
  Suspense,
  use,
  useMemo,
} from 'react';
import {Fragment} from 'react/jsx-runtime';

// Below-the-fold sections are lazy loaded so only the hero (and whatever
// immediately follows it) ships in the initial chunk.
const LazyFeaturesGrid = lazy(() =>
  import('@common/ui/landing-page/features/features-grid'),
);
const LazyFeatureWithScreenshot = lazy(() =>
  import('@common/ui/landing-page/features/feature-with-screenshot').then(
    m => ({default: m.FeatureWithScreenshot}),
  ),
);
const LazyLandingPageFaq = lazy(() =>
  import('@common/ui/landing-page/faq/landing-page-faq').then(m => ({
    default: m.LandingPageFaq,
  })),
);
const LazyLandingPagePricing = lazy(() =>
  import('@common/ui/landing-page/pricing/landing-page-pricing').then(m => ({
    default: m.LandingPagePricing,
  })),
);
const LazyCtaSimpleCentered = lazy(() =>
  import('@common/ui/landing-page/cta/cta-simple-centered').then(m => ({
    default: m.CtaSimpleCentered,
  })),
);
const LazyLandingPageFooter = lazy(() =>
  import('@common/ui/landing-page/footer/landing-page-footer').then(m => ({
    default: m.LandingPageFooter,
  })),
);

export function LandingPage({children}: {children?: ReactNode}) {
  const isPreview = useSettingsPreviewMode().isInsideSettingsPreview;
  const {landingPage} = useSettings();
  const {sections: contextSections, adSlotAfterHero} = use(LandingPageContext);

  // in landing page editor we'll be editing section config in settings, so we need
  // to use that instead of landing page data query to get live preview updates
  const rawSections =
    isPreview && landingPage?.sections ? landingPage.sections : contextSections;
  const sections = useMemo(() => normalizeSections(rawSections), [rawSections]);

  const heroAdSlotIndex = adSlotAfterHero
    ? sections.findIndex(s => s.name.startsWith('hero-'))
    : null;

  useLandingSectionViews(sections);

  return (
    <div>
      <DefaultMetaTags />
      {children}
      {sections.map((section, index) => (
        <Fragment key={index}>
          <SectionErrorBoundary sectionName={section.name}>
            <Suspense
              fallback={
                <SectionFallback
                  name={section.name}
                  background={section.background}
                  spacing={section.spacing}
                  align={section.align}
                />
              }
            >
              <div data-section-name={section.name}>
                <Section config={section} index={index} />
              </div>
            </Suspense>
          </SectionErrorBoundary>
          {heroAdSlotIndex === index && adSlotAfterHero && (
            <AdHost slot={adSlotAfterHero} className="px-8" />
          )}
        </Fragment>
      ))}
    </div>
  );
}

type SectionProps = {
  config: NormalizedSection;
  index: number;
};
function Section({config, index}: SectionProps) {
  const {sectionRenderers} = use(LandingPageContext);

  // A name that IS in the shared registry always renders the shared component,
  // which is the behaviour the old switch-first structure had. Anything else is
  // an app-registered section (Keekii's `channel`) and goes to the app's
  // renderer. `isSharedSectionConfig` is a real lookup against the registry,
  // not a cast, so the shared switch below narrows for real.
  if (isSharedSectionConfig(config)) {
    switch (config.name) {
      case 'hero-split-with-screenshot':
        return <HeroSplitWithScreenshot config={config} />;
      case 'hero-with-background-image':
        return <HeroWithBackgroundImage config={config} />;
      case 'hero-simple-centered':
        return <HeroSimpleCentered config={config} />;
      case 'feature-with-screenshot':
        return <LazyFeatureWithScreenshot config={config} />;
      case 'features-grid':
        return <LazyFeaturesGrid config={config} />;
      case 'faq':
        return <LazyLandingPageFaq config={config} />;
      case 'cta-simple-centered':
        return <LazyCtaSimpleCentered config={config} />;
      case 'pricing':
        return <LazyLandingPagePricing config={config} />;
      case 'footer':
        return <LazyLandingPageFooter config={config} />;
      default: {
        // Exhaustiveness guard. Adding a section to `SectionConfig` without
        // adding a case here is now a compile error, rather than the silently
        // blank section the old `default: return null` allowed.
        const unhandled: never = config;
        return unhandled;
      }
    }
  }

  const AppRenderer = sectionRenderers?.[config.name];
  return AppRenderer ? <AppRenderer config={config} index={index} /> : null;
}