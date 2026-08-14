import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from './reveal';

@Component({
  imports: [Reveal],
  template: `<p appReveal>Revealed content</p>`,
})
class Host {}

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

describe('Reveal', () => {
  let observe: ReturnType<typeof vi.fn>;
  let lastCallback: ObserverCallback;

  beforeEach(() => {
    observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        disconnect = vi.fn();
        unobserve = vi.fn();
        constructor(callback: ObserverCallback) {
          lastCallback = callback;
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const stubViewport = (options: { reducedMotion: boolean; rect: Partial<DOMRect> }) => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: options.reducedMotion,
    } as MediaQueryList);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(options.rect as DOMRect);
  };

  it('arms elements that start below the fold', async () => {
    stubViewport({ reducedMotion: false, rect: { top: 5000, bottom: 5200 } });

    const { container } = await render(Host);
    const target = container.querySelector('p')!;

    expect(target.classList.contains('reveal-armed')).toBe(true);
    expect(observe).toHaveBeenCalledWith(target);
  });

  it('leaves content already in view untouched, so hydration cannot flash', async () => {
    stubViewport({ reducedMotion: false, rect: { top: 10, bottom: 200 } });

    const { container } = await render(Host);

    expect(container.querySelector('p')!.classList.contains('reveal-armed')).toBe(false);
    expect(observe).not.toHaveBeenCalled();
  });

  it('reveals content the visitor scrolled straight past', async () => {
    stubViewport({ reducedMotion: false, rect: { top: 5000, bottom: 5200 } });

    const { container } = await render(Host);
    const target = container.querySelector('p')!;

    // Jumping to an anchor can move an element above the fold between callbacks, so
    // it reports as not intersecting. Without this it would stay invisible forever.
    lastCallback([{ isIntersecting: false, boundingClientRect: { bottom: -320 } as DOMRect }]);

    expect(target.classList.contains('reveal-visible')).toBe(true);
  });

  it('does nothing when the visitor asks for reduced motion', async () => {
    stubViewport({ reducedMotion: true, rect: { top: 5000, bottom: 5200 } });

    const { container } = await render(Host);

    expect(container.querySelector('p')!.classList.contains('reveal-armed')).toBe(false);
    expect(observe).not.toHaveBeenCalled();
  });
});
