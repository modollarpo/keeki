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

/**
 * Config for a section the **app** registers at runtime rather than one defined
 * by the shared registry (for example Keekii's `channel`).
 *
 * The shared renderer cannot know the app's section shapes, so this type is
 * deliberately open — `unknown` rather than `any`, so an app renderer has to
 * narrow what it actually reads instead of inheriting an unchecked `any`. The
 * price is that the app narrows its own fields; the benefit is that a wrong
 * field name or type is a compile error at the point of use rather than an
 * `undefined` at runtime.
 *
 * The commonly-shared presentation fields are still spelled out, because those
 * the app genuinely can rely on being present.
 *
 * It is deliberately NOT a member of {@link SectionConfig}. An open `name: string`
 * in the same union would defeat the discriminant: TypeScript cannot exclude a
 * `string`-typed member from a `case 'faq'` branch, so every shared section would
 * stop narrowing. Keeping it separate is what lets `SectionConfig` stay a real
 * discriminated union and lets the section switch be checked for exhaustiveness.
 */
export type AppSectionConfig = SectionPresentation & {
  name: string;
  badge?: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
};

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

/**
 * What {@link normalizeSections} actually produces: a shared section, or an
 * app-registered one that the shared layer knows nothing about. Callers that
 * need to render either use this; callers that need the shared components use
 * `isSharedSectionConfig` to narrow it first.
 */
export type NormalizedSection = SectionConfig | AppSectionConfig;

/**
 * Narrows an untrusted `channelId` from a stored section config. Returns null
 * rather than passing the raw value through, so a config edited by hand in the
 * admin cannot smuggle an unexpected type into a query.
 */
export function readSectionChannelId(
  config: AppSectionConfig,
): number | string | null {
  const {channelId} = config;
  if (typeof channelId === 'number' || typeof channelId === 'string') {
    return channelId;
  }
  return null;
}
