import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideMovement } from 'angular-movement';
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

  const renderHost = () => render(Host, { providers: [provideMovement()] });

  it('arms elements that start below the fold', async () => {
    stubViewport({ reducedMotion: false, rect: { top: 5000, bottom: 5200 } });

    const { container } = await renderHost();
    const target = container.querySelector('p')!;

    expect(target.style.opacity).toBe('0');
    expect(observe).toHaveBeenCalledWith(target);
  });

  it('leaves content already in view untouched, so hydration cannot flash', async () => {
    stubViewport({ reducedMotion: false, rect: { top: 10, bottom: 200 } });

    const { container } = await renderHost();

    expect(container.querySelector('p')!.style.opacity).toBe('');
    expect(observe).not.toHaveBeenCalled();
  });

  it('reveals content the visitor scrolled straight past', async () => {
    stubViewport({ reducedMotion: false, rect: { top: 5000, bottom: 5200 } });

    const { container } = await renderHost();
    const target = container.querySelector('p')!;

    // Jumping to an anchor can move an element above the fold between callbacks, so
    // it reports as not intersecting. Without this it would stay invisible forever.
    lastCallback([{ isIntersecting: false, boundingClientRect: { bottom: -320 } as DOMRect }]);

    // The hidden start state is handed back to the animation, which owns opacity from
    // here on — leaving the inline value in place would override it.
    expect(target.style.opacity).toBe('');
  });

  it('does nothing when the visitor asks for reduced motion', async () => {
    stubViewport({ reducedMotion: true, rect: { top: 5000, bottom: 5200 } });

    const { container } = await renderHost();

    expect(container.querySelector('p')!.style.opacity).toBe('');
    expect(observe).not.toHaveBeenCalled();
  });
});
