import {
  heroSectionDefs,
  sectionDefs,
} from '@common/ui/landing-page/section-defs';
import {ReactNode} from 'react';

/**
 * Labels are derived from the section registry so the admin gallery and the
 * accordion list can never drift apart.
 */
export const heroSectionLabels: Record<string, ReactNode> =
  Object.fromEntries(heroSectionDefs.map(def => [def.name, def.label]));

export const sectionLabels: Record<string, ReactNode> = Object.fromEntries(
  sectionDefs.map(def => [def.name, def.label]),
);