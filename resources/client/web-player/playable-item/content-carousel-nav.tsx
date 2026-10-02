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
 * arrows always point at the content they move, they sit at the vertical
 * centre of the items, and they never drift into the header line. Keeping them
 * outside the scroller also means they do not get clipped by the carousel's
 * `overflow-x` or ride along with it while scrolling.
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
  className?: string;
}
export function ContentCarouselArrow({
  controls,
  direction,
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
      className={cn('rounded-full', className)}
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

interface ContentCarouselNavProps {
  controls: ContentCarouselControls;
  className?: string;
  children: ReactNode;
}
/**
 * Wraps the scrolling grid with a leading and a trailing arrow. The child is
 * expected to be the scroll container itself.
 *
 * Both arrows are dropped while the rail has no overflow, so a short section
 * does not sit there advertising navigation it cannot offer. Before the first
 * measurement they render, because assuming "not scrollable" would visibly
 * shift the rail in once the ResizeObserver reports back.
 */
export function ContentCarouselNav({
  controls,
  className,
  children,
}: ContentCarouselNavProps) {
  const showArrows = controls.scrollable !== false;

  return (
    <div className={cn('flex items-center gap-1 md:gap-2', className)}>
      {showArrows ? (
        <ContentCarouselArrow controls={controls} direction="prev" />
      ) : null}
      {children}
      {showArrows ? (
        <ContentCarouselArrow controls={controls} direction="next" />
      ) : null}
    </div>
  );
}
