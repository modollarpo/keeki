import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {ReactNode} from 'react';

type SectionHeadingProps = {
  badge?: ReactNode;
  title?: string;
  description?: string;
  align?: 'center' | 'left';
  /** Semantic level. Defaults to h2; used for the page hero. */
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
  titleClassName?: string;
};

/**
 * Unified eyebrow/title/description block used by every non-hero section (and the
 * hero, at h1 level). Consistent type scale and measure keep the page looking like
 * one designed system instead of a stack of independent section templates.
 */
export function SectionHeading({
  badge,
  title,
  description,
  align = 'center',
  as: Tag = 'h2',
  id,
  className,
  titleClassName,
}: SectionHeadingProps) {
  if (!badge && !title && !description) {
    return null;
  }

  return (
    <div
      className={cn(
        align === 'center'
          ? 'mx-auto max-w-2xl text-center lg:text-center'
          : 'max-w-2xl lg:mx-0 text-left',
        className,
      )}
    >
      {badge ? (
        <p className="text-sm/6 font-semibold tracking-widest uppercase text-primary">
          {typeof badge === 'string' ? <Trans message={badge} /> : badge}
        </p>
      ) : null}
      {title ? (
        <Tag
          id={id}
          className={cn(
            'mt-2 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl',
            titleClassName,
          )}
        >
          <Trans message={title} />
        </Tag>
      ) : null}
      {description ? (
        <p className="mt-6 text-lg leading-8 text-pretty text-muted-foreground">
          <Trans message={description} />
        </p>
      ) : null}
    </div>
  );
}