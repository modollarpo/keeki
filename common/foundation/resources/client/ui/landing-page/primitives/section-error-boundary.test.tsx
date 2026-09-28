import {SectionErrorBoundary} from '@common/ui/landing-page/primitives/section-error-boundary';
import {render, screen} from '@testing-library/react';
import {ErrorInfo} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

/**
 * The behaviour worth protecting: a section that throws must not remove the
 * rest of the page. That is the entire reason the boundary exists, so it is
 * tested as an integration between the boundary and its siblings rather than in
 * isolation.
 */
function Boom({shouldThrow}: {shouldThrow: boolean}) {
  if (shouldThrow) {
    throw new Error('section exploded');
  }
  return <p>section content</p>;
}

describe('SectionErrorBoundary', () => {
  beforeEach(() => {
    // React logs the caught error; silencing keeps test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders its children when nothing throws', () => {
    render(
      <SectionErrorBoundary sectionName="faq">
        <Boom shouldThrow={false} />
      </SectionErrorBoundary>,
    );

    expect(screen.getByText('section content')).toBeInTheDocument();
  });

  it('replaces the failing section and keeps siblings on the page', () => {
    render(
      <div>
        <p>hero</p>
        <SectionErrorBoundary sectionName="faq">
          <Boom shouldThrow />
        </SectionErrorBoundary>
        <p>footer</p>
      </div>,
    );

    expect(screen.getByText('hero')).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
    expect(screen.queryByText('section content')).not.toBeInTheDocument();
  });

  /**
   * `aria-hidden` keeps the placeholder out of the accessibility tree, but the
   * `data-` attribute is what identifies *which* section failed for whoever
   * ends up looking at the DOM.
   */
  it('marks the fallback with the failing section name', () => {
    const {container} = render(
      <SectionErrorBoundary sectionName="faq">
        <Boom shouldThrow />
      </SectionErrorBoundary>,
    );

    expect(container.querySelector('[data-section-error="faq"]')).toBeInTheDocument();
  });

  it('hides the fallback from assistive technology', () => {
    const {container} = render(
      <SectionErrorBoundary sectionName="faq">
        <Boom shouldThrow />
      </SectionErrorBoundary>,
    );

    expect(container.querySelector('[data-section-error]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('reports the error and the section name', () => {
    const onError = vi.fn();
    const error = new Error('reported');

    render(
      <SectionErrorBoundary sectionName="pricing" onError={onError}>
        <Thrower error={error} />
      </SectionErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const [reported, info] = onError.mock.calls[0] as [Error, ErrorInfo];

    // The error instance is forwarded unchanged so a reporting backend can
    // read its own fields off it.
    expect(reported).toBe(error);
    // React supplies the real stack, so only its presence is asserted.
    expect(typeof info.componentStack).toBe('string');
    expect(info.componentStack).not.toBe('');
  });

  it('prefers a caller-supplied fallback over the default', () => {
    render(
      <SectionErrorBoundary sectionName="faq" fallback={<p>custom fallback</p>}>
        <Boom shouldThrow />
      </SectionErrorBoundary>,
    );

    expect(screen.getByText('custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('section content')).not.toBeInTheDocument();
  });
});

/** Always throws, so the return type is `never` rather than `void`. */
function Thrower({error}: {error: Error}): never {
  throw error;
}
