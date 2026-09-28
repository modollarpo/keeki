import {LandingPageFooterConfig} from '@common/ui/landing-page/footer/landing-page-footer';
import {
  AppSectionConfig,
  NormalizedSection,
  SectionBackground,
  SectionConfig,
  SectionPresentation,
  SectionSpacing,
} from '@common/ui/landing-page/landing-page-config';
import {
  getSectionDefinition,
  sectionDefsByKey,
} from '@common/ui/landing-page/section-defs';

/**
 * Used when a stored section is so malformed it cannot be rendered at all. The
 * footer is the one section that needs no required fields, so it is the only
 * safe thing to fall back to — and it is a real config, not a cast.
 */
const FALLBACK_SECTION: LandingPageFooterConfig = {name: 'footer'};

/**
 * Normalizes a raw snapshot of `client.landingPage.sections` (as persisted by any
 * previous version of the app) into a stable `SectionConfig[]`.
 *
 * The stored config is hand-edited through the admin and has accumulated a few
 * real-world quirks over time (e.g. `buttons` stored as a single object instead of
 * an array, stringified numbers, legacy `mutedBg`/`inPanel` booleans). This is a
 * single, pure, defensive gate every render path goes through so components can
 * trust their props. It never writes back to the snapshot.
 */
export function normalizeSections(sections: unknown): NormalizedSection[] {
  if (!Array.isArray(sections)) {
    return [];
  }
  return sections.map((raw, index) => normalizeSection(raw, index));
}

export function normalizeSection(raw: unknown, index: number): NormalizedSection {
  if (!isRecord(raw) || typeof raw.name !== 'string') {
    return FALLBACK_SECTION;
  }

  const def = sectionDefsByKey[raw.name];

  // Custom sections (registered at runtime by the app, e.g. `channel`) are not in
  // the shared registry, so there is no definition to normalize them against.
  // Keep them untouched so their renderer keeps working. This is the one place
  // an untyped record is asserted into the union: the data is genuinely unknown
  // here, which is exactly why it is funnelled through this one defensive gate
  // rather than being cast at the render site.
  if (!def) {
    return toAppSectionConfig(raw);
  }

  const normalized = {...raw};
  const presentation = resolvePresentation(normalized);

  if (normalized.title !== undefined) {
    normalized.title = coerceText(normalized.title);
  }
  if (normalized.badge !== undefined) {
    normalized.badge = coerceText(normalized.badge);
  }
  if (normalized.description !== undefined) {
    normalized.description = coerceText(normalized.description);
  }
  if (normalized.buttons !== undefined) {
    normalized.buttons = coerceButtons(normalized.buttons);
  }
  if (normalized.features !== undefined) {
    normalized.features = coerceFeatureList(normalized.features);
  }
  if (normalized.questions !== undefined) {
    normalized.questions = coerceQuestionList(normalized.questions);
  }
  if (normalized.image !== undefined && isRecord(normalized.image)) {
    normalized.image = {...normalized.image};
  }
  if (normalized.bgColors !== undefined && isRecord(normalized.bgColors)) {
    normalized.bgColors = {...normalized.bgColors};
  }

  return {...normalized, ...presentation} as SectionConfig;
}

function resolvePresentation(
  raw: Record<string, unknown>,
): SectionPresentation {
  const def = getSectionDefinition(raw.name as string)!;

  return {
    variant: resolveVariant(raw, def),
    background: resolveBackground(raw),
    spacing: resolveSpacing(raw),
    align: resolveAlign(raw),
  };
}

function resolveVariant(
  raw: Record<string, unknown>,
  def: {defaultVariant: string; variants: {value: string}[]},
): string {
  if (typeof raw.variant === 'string') {
    const isKnown = def.variants.some(v => v.value === raw.variant);
    if (isKnown) {
      return raw.variant;
    }
  }
  return def.defaultVariant;
}

function resolveBackground(raw: Record<string, unknown>): SectionBackground {
  const valid: SectionBackground[] = ['default', 'muted', 'panel', 'elevated'];
  if (typeof raw.background === 'string' && valid.includes(raw.background as SectionBackground)) {
    return raw.background as SectionBackground;
  }
  // Preserve legacy boolean knobs.
  if (raw.mutedBg === true) {
    return 'muted';
  }
  const def = getSectionDefinition(raw.name as string);
  return def?.defaultBackground ?? 'default';
}

function resolveSpacing(raw: Record<string, unknown>): SectionSpacing {
  const valid: SectionSpacing[] = ['compact', 'default', 'spacious'];
  if (typeof raw.spacing === 'string' && valid.includes(raw.spacing as SectionSpacing)) {
    return raw.spacing as SectionSpacing;
  }
  return 'default';
}

function resolveAlign(raw: Record<string, unknown>): 'center' | 'left' {
  return raw.align === 'left' ? 'left' : 'center';
}

/**
 * Accepts either an array of buttons or a single button object. The live config
 * for the CTA section has `buttons` stored as a single object, so we normalize it
 * to an array instead of letting it crash the renderer.
 */
function coerceButtons(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord).map(button => ({...button}));
  }
  if (isRecord(value)) {
    return [{...value}];
  }
  return [];
}

function coerceFeatureList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(isRecord)
    .map(feature => ({
      ...feature,
      title: coerceText(feature.title),
      description: coerceText(feature.description),
    }));
}

function coerceQuestionList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(isRecord)
    .map(item => ({
      ...item,
      question: coerceText(item.question),
      answer: coerceText(item.answer),
    }));
}

function coerceText(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates the minimum an app-registered section needs to render, then widens
 * it into {@link AppSectionConfig}. The fields the shared layer understands are
 * checked; anything else is carried through as `unknown` for the app renderer to
 * narrow. A record with no usable `name` cannot be routed to a renderer at all,
 * so it is rejected rather than passed along.
 */
function toAppSectionConfig(raw: Record<string, unknown>): AppSectionConfig {
  if (typeof raw.name !== 'string' || raw.name.length === 0) {
    return FALLBACK_SECTION;
  }
  const config: AppSectionConfig = {...raw, name: raw.name};
  if (typeof raw.badge === 'string') {
    config.badge = raw.badge;
  } else {
    delete config.badge;
  }
  if (typeof raw.title === 'string') {
    config.title = raw.title;
  } else {
    delete config.title;
  }
  if (typeof raw.description === 'string') {
    config.description = raw.description;
  } else {
    delete config.description;
  }
  return config;
}