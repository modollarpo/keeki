import {BaseHeroConfig} from '@common/ui/landing-page/hero/base-hero-config';
import {
  AppSectionConfig,
  NormalizedSection,
} from '@common/ui/landing-page/landing-page-config';
import {Settings} from '@ui/settings/settings';
import {ComponentType, createContext, ReactElement} from 'react';

export type LandingPageContextValue = {
  defaultIcons: Record<string, ReactElement>;
  sections: NormalizedSection[];
  /**
   * Renderers for sections the app registers at runtime. The config is
   * `AppSectionConfig` (open, `unknown`-valued) rather than `any`, so an app
   * renderer is forced to narrow the fields it reads.
   */
  sectionRenderers?: Record<
    string,
    ComponentType<{config: AppSectionConfig; index: number}>
  >;
  heroSearchBarSlot?: ComponentType<{
    background?: string;
    config: BaseHeroConfig;
  }>;
  adSlotAfterHero?: keyof Omit<NonNullable<Settings['ads']>, 'disable'>;
};

export const LandingPageContext = createContext<LandingPageContextValue>(null!);
