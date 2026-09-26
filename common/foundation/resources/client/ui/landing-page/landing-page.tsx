import {AdHost} from '@common/admin/ads/ad-host';
import {useSettingsPreviewMode} from '@common/admin/settings/preview/use-settings-preview-mode';
import {DefaultMetaTags} from '@common/seo/default-meta-tags';
import {HeroSimpleCentered} from '@common/ui/landing-page/hero/hero-simple-centered';
import {HeroSplitWithScreenshot} from '@common/ui/landing-page/hero/hero-split-with-screenshot';
import {HeroWithBackgroundImage} from '@common/ui/landing-page/hero/hero-with-background-image';
import {SectionConfig} from '@common/ui/landing-page/landing-page-config';
import {LandingPageContext} from '@common/ui/landing-page/landing-page-context';
import {normalizeSections} from '@common/ui/landing-page/normalize/normalize-sections';
import {useSettings} from '@ui/settings/use-settings';
import {
  ComponentType,
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

  return (
    <div>
      <DefaultMetaTags />
      {children}
      {sections.map((section, index) => (
        <Fragment key={index}>
          <Suspense fallback={null}>
            <Section config={section} index={index} />
          </Suspense>
          {heroAdSlotIndex === index && adSlotAfterHero && (
            <AdHost slot={adSlotAfterHero} className="px-8" />
          )}
        </Fragment>
      ))}
    </div>
  );
}

type SectionProps = {
  config: SectionConfig;
  index: number;
};
function Section({config, index}: SectionProps) {
  const {sectionRenderers} = use(LandingPageContext);
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
      const Renderer = sectionRenderers?.[(config as any).name] as
        | ComponentType<{config: unknown; index: number}>
        | undefined;
      if (!Renderer) {
        return null;
      }
      return <Renderer config={config} index={index} />;
    }
  }
}