import {
  SectionBackground,
  SectionConfig,
  SectionSpacing,
} from '@common/ui/landing-page/landing-page-config';
import {Trans} from '@ui/i18n/trans';
import {
  BadgeCheckIcon,
  CircleDollarSignIcon,
  Grid3X3Icon,
  ImageIcon,
  LayoutPanelTopIcon,
  MailIcon,
  MessageCircleQuestionIcon,
  SendIcon,
  SparklesIcon,
} from 'lucide-react';
import {ReactNode} from 'react';

export type SectionVariant = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
};

export type SectionDefinition = {
  name: SectionConfig['name'];
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  defaultVariant: string;
  variants: SectionVariant[];
  defaultBackground: SectionBackground;
  defaultSpacing: SectionSpacing;
  /** Whether the admin should expose the heading alignment picker. */
  allowAlign?: boolean;
};

export const sectionBackgroundOptions: Record<SectionBackground, ReactNode> = {
  default: <Trans message="Default" />,
  muted: <Trans message="Muted" />,
  elevated: <Trans message="Elevated" />,
  panel: <Trans message="Panel" />,
};

export const sectionSpacingOptions: Record<SectionSpacing, ReactNode> = {
  compact: <Trans message="Compact" />,
  default: <Trans message="Default" />,
  spacious: <Trans message="Spacious" />,
};

export const sectionAlignOptions = {
  center: <Trans message="Center" />,
  left: <Trans message="Left" />,
} as const;

export const heroVariants: SectionVariant[] = [
  {
    value: 'classic',
    label: <Trans message="Classic" />,
    description: <Trans message="Balanced grid or panel layout with soft color accents." />,
  },
  {
    value: 'spotlight',
    label: <Trans message="Spotlight" />,
    description: <Trans message="Dark cinematic hero with a glowing center spotlight." />,
  },
];

export const sectionDefs: SectionDefinition[] = [
  {
    name: 'hero-with-background-image',
    label: <Trans message="Hero with background image" />,
    description: <Trans message="Full-bleed cinematic hero with search bar." />,
    icon: <ImageIcon />,
    defaultVariant: 'spotlight',
    variants: heroVariants,
    defaultBackground: 'default',
    defaultSpacing: 'default',
  },
  {
    name: 'hero-split-with-screenshot',
    label: <Trans message="Hero split with screenshot" />,
    description: <Trans message="Split layout with product screenshot on the right." />,
    icon: <LayoutPanelTopIcon />,
    defaultVariant: 'classic',
    variants: [
      {
        value: 'classic',
        label: <Trans message="Classic" />,
        description: <Trans message="Balanced split with screenshot frame." />,
      },
    ],
    defaultBackground: 'default',
    defaultSpacing: 'default',
  },
  {
    name: 'hero-simple-centered',
    label: <Trans message="Hero simple centered" />,
    description: <Trans message="Centered headline with optional search bar." />,
    icon: <SparklesIcon />,
    defaultVariant: 'classic',
    variants: [
      {
        value: 'classic',
        label: <Trans message="Classic" />,
        description: <Trans message="Floating navbar with centered headline." />,
      },
    ],
    defaultBackground: 'default',
    defaultSpacing: 'default',
  },
  {
    name: 'feature-with-screenshot',
    label: <Trans message="Feature with screenshot" />,
    description: <Trans message="Side-by-side feature list and image panel." />,
    icon: <LayoutPanelTopIcon />,
    defaultVariant: 'split',
    variants: [
      {
        value: 'split',
        label: <Trans message="Split" />,
        description: <Trans message="Two-column layout with bold typography." />,
      },
    ],
    defaultBackground: 'default',
    defaultSpacing: 'default',
    allowAlign: true,
  },
  {
    name: 'features-grid',
    label: <Trans message="Features grid" />,
    description: <Trans message="Grid of feature cards with icons." />,
    icon: <Grid3X3Icon />,
    defaultVariant: 'tiles',
    variants: [
      {
        value: 'tiles',
        label: <Trans message="Tiles" />,
        description: <Trans message="Card tiles with icon chips and soft borders." />,
      },
      {
        value: 'list',
        label: <Trans message="List" />,
        description: <Trans message="Compact rows, ideal for dense content." />,
      },
    ],
    defaultBackground: 'muted',
    defaultSpacing: 'default',
    allowAlign: true,
  },
  {
    name: 'faq',
    label: <Trans message="FAQ" />,
    description: <Trans message="Accordion of frequent questions." />,
    icon: <MessageCircleQuestionIcon />,
    defaultVariant: 'default',
    variants: [
      {value: 'default', label: <Trans message="Default" />},
      {value: 'bordered', label: <Trans message="Bordered" />},
      {value: 'separated', label: <Trans message="Separated" />},
    ],
    defaultBackground: 'default',
    defaultSpacing: 'default',
    allowAlign: true,
  },
  {
    name: 'cta-simple-centered',
    label: <Trans message="Call to action" />,
    description: <Trans message="Centered prompt with action buttons." />,
    icon: <SendIcon />,
    defaultVariant: 'card',
    variants: [
      {
        value: 'card',
        label: <Trans message="Card" />,
        description: <Trans message="Rounded panel with radial glow." />,
      },
      {
        value: 'full',
        label: <Trans message="Full bleed" />,
        description: <Trans message="Full-width gradient band with centered content." />,
      },
    ],
    defaultBackground: 'default',
    defaultSpacing: 'compact',
    allowAlign: true,
  },
  {
    name: 'pricing',
    label: <Trans message="Pricing" />,
    description: <Trans message="Billing cycle toggle and pricing table." />,
    icon: <CircleDollarSignIcon />,
    defaultVariant: 'default',
    variants: [
      {value: 'default', label: <Trans message="Default" />},
    ],
    defaultBackground: 'default',
    defaultSpacing: 'default',
    allowAlign: true,
  },
  {
    name: 'footer',
    label: <Trans message="Footer" />,
    description: <Trans message="Platform footer with links and socials." />,
    icon: <MailIcon />,
    defaultVariant: 'default',
    variants: [{value: 'default', label: <Trans message="Default" />}],
    defaultBackground: 'default',
    defaultSpacing: 'compact',
  },
];

export const sectionDefsByKey: Record<string, SectionDefinition> = Object.fromEntries(
  sectionDefs.map(def => [def.name, def]),
);

export function getSectionDefinition(name: string): SectionDefinition | undefined {
  return sectionDefsByKey[name];
}

/**
 * Narrows a section config to the shared `SectionConfig` union.
 *
 * This is a real runtime check against the shared registry, not a type
 * assertion: a name that is not in {@link sectionDefsByKey} is by definition an
 * app-registered section. It exists because app sections cannot live in the
 * union — an open `name: string` member would stop TypeScript narrowing every
 * shared `case` — so the boundary has to be crossed with a guard rather than a
 * cast.
 */
export function isSharedSectionConfig(
  config: {name: string},
): config is SectionConfig {
  return sectionDefsByKey[config.name] !== undefined;
}
export const heroSectionDefs = sectionDefs.filter(def => def.name.startsWith('hero-'));

export const heroSectionNames = new Set(
  heroSectionDefs.map(def => def.name),
) as Set<SectionConfig['name']>;

// Used as a placeholder icon for custom (app-provided) sections.
export const CustomSectionIcon = BadgeCheckIcon;