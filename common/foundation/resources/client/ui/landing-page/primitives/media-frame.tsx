import {cn} from '@ui/utils/cn';

type MediaFrameProps = {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  /**
   * Padding of the chrome around the screenshot. `md` mirrors the classic hero
   * frame, `lg` gives a wider cinematic margin.
   */
  padding?: 'md' | 'lg';
  /** Renders a soft brand glow behind the frame. */
  glow?: boolean;
};

/**
 * Consistent device-like frame for product screenshots. Every screenshot on the
 * page (hero, feature sections) renders through this so edges, radius, borders and
 * shadows stay identical.
 */
export function MediaFrame({
  src,
  alt = '',
  width,
  height,
  className,
  padding = 'md',
  glow,
}: MediaFrameProps) {
  return (
    <div className={cn('relative', className)}>
      {glow ? (
        <div
          aria-hidden="true"
          className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary/15 to-primary/5 opacity-60 blur-2xl"
        />
      ) : null}
      <div
        className={cn(
          padding === 'lg' ? '-m-4 rounded-3xl p-4' : 'rounded-2xl p-2',
          'border border-border/70 bg-muted/60 shadow-xl',
        )}
      >
        <img
          alt={alt}
          src={src}
          width={width}
          height={height}
          loading="lazy"
          className="w-full rounded-md border border-black/5 bg-background object-cover"
        />
      </div>
    </div>
  );
}