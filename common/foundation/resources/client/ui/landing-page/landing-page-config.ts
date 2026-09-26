import type {MenuItemConfig} from '@common/menus/menu-config';
import type {CtaSimpleCenteredConfig} from '@common/ui/landing-page/cta/cta-simple-centered';
import type {LandingPageFaqConfig} from '@common/ui/landing-page/faq/landing-page-faq';
import type {FeatureWithScreenshotConfig} from '@common/ui/landing-page/features/feature-with-screenshot';
import type {FeaturesGridConfig} from '@common/ui/landing-page/features/features-grid';
import type {LandingPageFooterConfig} from '@common/ui/landing-page/footer/landing-page-footer';
import {HeroSimpleCenteredConfig} from '@common/ui/landing-page/hero/hero-simple-centered';
import type {HeroSplitWithScreenshotConfig} from '@common/ui/landing-page/hero/hero-split-with-screenshot';
import type {HeroWithBackgroundImageConfig} from '@common/ui/landing-page/hero/hero-with-background-image';
import type {LandingPagePricingConfig} from '@common/ui/landing-page/pricing/landing-page-pricing';
import {ButtonColor, ButtonVariant} from '@shadcn/button/button';

export type LandingPageButtonConfig = MenuItemConfig & {
  variant: ButtonVariant;
  color: ButtonColor;
};

export type LandingPageImageConfig = {
  src: string;
  width?: number;
  height?: number;
};

/**
 * Shared presentation fields every section can carry. All fields are optional so
 * configs persisted in `client.landingPage.sections` by older versions of the app
 * remain valid. Missing values are resolved by {@link normalizeSections} using the
 * defaults declared in the section registry.
 */
export type SectionPresentation = {
  /**
   * Visual variant for the section. Supported values are defined per-section in
   * `common/ui/landing-page/section-defs.tsx`.
   */
  variant?: string;
  /** Background treatment: plain, muted, elevated or a full-bleed dark panel. */
  background?: SectionBackground;
  /** Vertical rhythm of the section. */
  spacing?: SectionSpacing;
  /** Horizontal alignment of the section heading block. */
  align?: SectionAlign;
};

export type SectionBackground = 'default' | 'muted' | 'panel' | 'elevated';

export type SectionSpacing = 'compact' | 'default' | 'spacious';

export type SectionAlign = 'center' | 'left';

export type SectionConfig =
  | HeroSplitWithScreenshotConfig
  | HeroWithBackgroundImageConfig
  | HeroSimpleCenteredConfig
  | FeatureWithScreenshotConfig
  | FeaturesGridConfig
  | LandingPageFaqConfig
  | CtaSimpleCenteredConfig
  | LandingPagePricingConfig
  | LandingPageFooterConfig;
