import {SectionFallback} from '@common/ui/landing-page/primitives/section-skeleton';
import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

/**
 * The reason these placeholders exist is layout stability: the previous
 * `fallback={null}` made the page grow by a full section's height once each lazy
 * chunk arrived. So the assertion that matters is that a placeholder reserves
 * vertical space, not that it looks like anything in particular.
 */
function measureHeight(node: HTMLElement | null): number {
  // jsdom performs no layout, so height is asserted structurally: the element
  // must carry the vertical padding class that gives it its reserved size.
  return node?.className.includes('py-') ? 1 : 0;
}

describe('SectionFallback', () => {
  it('reserves vertical space for a known section', () => {
    const {container} = render(<SectionFallback name="pricing" />);

    expect(measureHeight(container.querySelector('[aria-hidden] > div'))).toBe(1);
  });

  it('reserves vertical space for an unknown section instead of rendering nothing', () => {
    const {container} = render(<SectionFallback name="some-future-section" />);

    expect(measureHeight(container.querySelector('[aria-hidden] > div'))).toBe(1);
  });

  it('is hidden from assistive technology', () => {
    const {container} = render(<SectionFallback name="faq" />);

    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument();
  });

  it('applies the requested background', () => {
    const {container} = render(<SectionFallback name="faq" background="muted" />);

    expect(container.querySelector('[aria-hidden]')?.className).toContain(
      'bg-muted',
    );
  });

  it('defaults to the page background', () => {
    const {container} = render(<SectionFallback name="faq" />);

    expect(container.querySelector('[aria-hidden]')?.className).toContain(
      'bg-background',
    );
  });

  it('applies the requested spacing', () => {
    const {container} = render(<SectionFallback name="faq" spacing="compact" />);

    expect(container.querySelector('[aria-hidden] > div')?.className).toContain(
      'py-16',
    );
  });

  it('applies the requested spacing for a spacious section', () => {
    const {container} = render(<SectionFallback name="faq" spacing="spacious" />);

    expect(container.querySelector('[aria-hidden] > div')?.className).toContain(
      'py-28',
    );
  });

  it('marks the heading left-aligned when asked', () => {
    const {container} = render(<SectionFallback name="faq" align="left" />);

    expect(container.querySelector('.text-left')).toBeInTheDocument();
  });

  it('centres the heading by default', () => {
    const {container} = render(<SectionFallback name="faq" />);

    expect(container.querySelector('.text-center')).toBeInTheDocument();
  });

  it('renders a distinct shape per section so one placeholder does not fit all', () => {
    const markup = (name: string) =>
      render(<SectionFallback name={name} />).container.innerHTML;

    expect(markup('pricing')).not.toBe(markup('faq'));
    expect(markup('features-grid')).not.toBe(markup('faq'));
  });
});
