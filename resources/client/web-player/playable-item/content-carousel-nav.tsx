import {Button} from '@shadcn/button/button';
import {cn} from '@ui/utils/cn';
import debounce from 'just-debounce-it';
import {ChevronLeftIcon, ChevronRightIcon} from 'lucide-react';
import {ReactNode, RefObject, useCallback, useEffect, useRef, useState} from 'react';

/**
 * Horizontal carousel plumbing
 * ────────────────────────────────────────────────────────────────────────────
 * The section header (title on the left, "See all" on the right) and the
 * navigation arrows are deliberately separate pieces.
 *
 * The arrows flank the scrolling grid itself rather than sharing a row with the
 * header, which is the pattern shoppers already know from product rails: the
 * arrows always point at the content they move and they sit at the vertical
 * centre of the items. They are absolutely positioned outside the scroller
 * rather than laid out beside it, so they cannot change the width of the rail,
 * and they cannot be clipped by the carousel's `overflow-x` or ride along with
 * it while scrolling. See ContentCarouselNav for why width is the deciding
 * factor here.
 */

export interface ContentCarouselControls {
  enablePrev: boolean;
  enableNext: boolean;
  /**
   * null until the rail has been measured, then whether it overflows at all.
   * Arrows are hidden for a rail that has nothing to scroll to.
   */
  scrollable: boolean | null;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  scrollAmount: () => number;
  containerRefCallback: (el: HTMLDivElement | null) => void;
}

export function useContentCarouselControls(): ContentCarouselControls {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemWidth = useRef<number>(0);

  const [enablePrev, setEnablePrev] = useState(false);
  const [enableNext, setEnableNext] = useState(true);
  const [scrollable, setScrollable] = useState<boolean | null>(null);

  const updateNavStatus = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el && itemWidth.current) {
      setEnablePrev(el.scrollLeft > 0);
      setEnableNext(
        Math.ceil(el.scrollWidth - el.scrollLeft - el.clientWidth) > 0,
      );
      setScrollable(el.scrollWidth - el.clientWidth > 0);
    }
  }, []);

  // enable/disable navigation buttons based on element scroll offset
  useEffect(() => {
    const el = scrollContainerRef.current;
    const handleScroll = debounce(() => updateNavStatus(), 100);
    if (el) {
      el.addEventListener('scroll', handleScroll);
    }
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [updateNavStatus]);

  // page by two items, which is the amount that feels like a "page" rather
  // than a nudge on a dense rail
  const scrollAmount = useCallback(() => itemWidth.current * 2, [itemWidth]);

  const containerRefCallback = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) {
        scrollContainerRef.current = null;
        return;
      }
      scrollContainerRef.current = el;
      const firstGridItem = el.children.item(0);
      if (!firstGridItem) {
        updateNavStatus();
        return;
      }
      const observer = new ResizeObserver(entries => {
        itemWidth.current = entries[0].contentRect.width;
        updateNavStatus();
      });
      observer.observe(firstGridItem);
      return () => {
        scrollContainerRef.current = null;
        observer.unobserve(firstGridItem);
        observer.disconnect();
      };
    },
    [updateNavStatus],
  );

  return {
    enablePrev,
    enableNext,
    scrollable,
    scrollAmount,
    scrollContainerRef,
    containerRefCallback,
  };
}

interface ContentCarouselArrowProps {
  controls: ContentCarouselControls;
  direction: 'prev' | 'next';
  inGutter?: boolean;
  className?: string;
}
export function ContentCarouselArrow({
  controls,
  direction,
  inGutter,
  className,
}: ContentCarouselArrowProps) {
  const isPrev = direction === 'prev';
  const disabled = isPrev ? !controls.enablePrev : !controls.enableNext;

  return (
    <Button
      type="button"
      variant="outline"
      color="default"
      size="icon"
      disabled={disabled}
      aria-label={isPrev ? 'Scroll carousel left' : 'Scroll carousel right'}
      className={cn(
        'carousel-nav-arrow size-9 rounded-full bg-background shadow-sm',
        isPrev ? 'carousel-nav-arrow-prev' : 'carousel-nav-arrow-next',
        inGutter && 'carousel-nav-arrow-gutter',
        className,
      )}
      onClick={() => {
        const el = controls.scrollContainerRef.current;
        if (!el) return;
        el.scrollBy({left: (isPrev ? -1 : 1) * controls.scrollAmount()});
      }}
    >
      {isPrev ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </Button>
  );
}

/** Arrow button (36px) plus the 10px gap it keeps from the rail. */
const GUTTER_SPACE_NEEDED = 46;

interface ContentCarouselNavProps {
  controls: ContentCarouselControls;
  className?: string;
  children: ReactNode;
}
/**
 * Wraps the scrolling grid with a leading and a trailing arrow. The child is
 * expected to be the scroll container itself.
 *
 * The arrows are absolutely positioned rather than placed in the layout beside
 * the rail. That matters for size, not just looks: `.content-grid` derives its
 * card width from the rail's width, so giving the arrows a share of it shrank
 * every album cover on the rail. Out of flow, the rail keeps the full width of
 * the section and the cards render exactly as they did before the arrows were
 * added.
 *
 * Being out of flow also makes them stable. Content cannot push them around,
 * they cannot resize the rail when they appear or disappear, and nothing
 * scrolls underneath them, so the click target is the same on every frame.
 *
 * Where the page leaves room beside the rail they sit out in the gutter and
 * clear the covers entirely. Where it does not they tuck against the ends of
 * the rail instead, so an arrow is never left half off the side of the screen.
 * Either way they are out of flow and cost the cards nothing.
 *
 * Both arrows are dropped while the rail has no overflow, so a short section
 * does not sit there advertising navigation it cannot offer.
 */
export function ContentCarouselNav({
  controls,
  className,
  children,
}: ContentCarouselNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [inGutter, setInGutter] = useState(false);
  const showArrows = controls.scrollable !== false;

  // Measured rather than breakpoint driven: the space beside a rail depends on
  // the page around it, not just on how wide the rail is.
  useEffect(() => {
    const el = navRef.current;

    if (!el) {
      return;
    }

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const viewport = document.documentElement.clientWidth;

      setInGutter(
        rect.left >= GUTTER_SPACE_NEEDED &&
          viewport - rect.right >= GUTTER_SPACE_NEEDED,
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div ref={navRef} className={cn('carousel-nav', className)}>
      {showArrows ? (
        <ContentCarouselArrow controls={controls} direction="prev" inGutter={inGutter} />
      ) : null}
      {children}
      {showArrows ? (
        <ContentCarouselArrow controls={controls} direction="next" inGutter={inGutter} />
      ) : null}
    </div>
  );
}
