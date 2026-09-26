import {ConfigIcon, ConfigIconWithBg} from '@common/ui/landing-page/config-icon';
import {SectionHeading} from '@common/ui/landing-page/primitives/section-heading';
import {SectionShell} from '@common/ui/landing-page/primitives/section-shell';
import {SectionPresentation} from '@common/ui/landing-page/landing-page-config';
import {Trans} from '@ui/i18n/trans';
import {IconTree} from '@ui/icons/create-svg-icon';
import {cn} from '@ui/utils/cn';

export type FeaturesGridConfig = SectionPresentation & {
  name: 'features-grid';
  title?: string;
  badge?: string;
  description?: string;
  maxColumns?: number | string;
  iconsOnTop?: boolean;
  mutedBg?: boolean;
  wrapIconsInBg?: boolean;
  features?: {
    title: string;
    description: string;
    icon?: string | IconTree[];
  }[];
};

type FeaturesGridProps = {
  config: FeaturesGridConfig;
};
export default function FeaturesGrid({config}: FeaturesGridProps) {
  const variant = config.variant ?? 'tiles';
  const isTiles = variant === 'tiles';
  return (
    <SectionShell background={config.background} spacing={config.spacing}>
      <SectionHeading
        badge={config.badge}
        title={config.title}
        description={config.description}
        align={config.align}
      />
      <ul
        className={cn(
          'mx-auto mt-16 grid grid-cols-1 sm:grid-cols-2 lg:max-w-none',
          getColumnsClassName(config.maxColumns),
          !isTiles &&
            (String(config.maxColumns) === '3' ? 'gap-8' : 'gap-10'),
        )}
      >
        {config.features?.map(feature => (
          <li key={feature.title}>
            {isTiles ? (
              <TileFeature
                feature={feature}
                iconsOnTop={config.iconsOnTop}
                wrapIconInBg={config.wrapIconsInBg}
              />
            ) : (
              <ListFeature feature={feature} iconsOnTop={config.iconsOnTop} />
            )}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

type FeatureItem = NonNullable<FeaturesGridConfig['features']>[number];

type FeatureProps = {
  feature: FeatureItem;
};

function TileFeature({
  feature,
  iconsOnTop,
  wrapIconInBg,
}: FeatureProps & {
  iconsOnTop?: boolean;
  wrapIconInBg?: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-xs transition-shadow hover:shadow-lg dark:bg-muted/40',
        iconsOnTop && 'flex flex-col items-center text-center',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-4',
          iconsOnTop && 'flex-col text-center',
        )}
      >
        {feature.icon ? (
          wrapIconInBg ? (
            <ConfigIconWithBg icon={feature.icon} />
          ) : (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 ring-inset">
              <ConfigIcon icon={feature.icon} className="size-6" />
            </div>
          )
        ) : null}
        <div>
          <h3 className="text-lg/7 font-semibold text-foreground">
            <Trans message={feature.title} />
          </h3>
          <p className="mt-2 text-base/7 text-muted-foreground">
            <Trans message={feature.description} />
          </p>
        </div>
      </div>
    </div>
  );
}

function ListFeature({
  feature,
  iconsOnTop,
}: FeatureProps & {iconsOnTop?: boolean}) {
  return (
    <div
      className={cn(
        'flex gap-x-6 gap-y-3',
        iconsOnTop && 'flex-col items-center text-center',
      )}
    >
      {feature.icon ? <ConfigIconWithBg icon={feature.icon} /> : null}
      <div className={cn('flex-auto', iconsOnTop && 'text-center')}>
        <div className="text-lg/7 font-semibold text-foreground">
          <Trans message={feature.title} />
        </div>
        <div className="mt-2 text-base/7 text-muted-foreground">
          <Trans message={feature.description} />
        </div>
      </div>
    </div>
  );
}

function getColumnsClassName(maxColumns?: number | string): string {
  switch (String(maxColumns)) {
    case '3':
      return 'lg:grid-cols-3';
    case '4':
      return 'lg:grid-cols-4';
    default:
      return 'lg:grid-cols-2';
  }
}