import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BgGlyphField } from './bg-glyph-field';

const stubContext = () => {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
  } as DOMRect);
  return context;
};

const preferReducedMotion = (reduce: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduce } as MediaQueryList);

@Component({
  imports: [BgGlyphField],
  template: `<app-bg-glyph-field><h2>Our own headline</h2></app-bg-glyph-field>`,
})
class WithContent {}

describe('BgGlyphField', () => {
  afterEach(() => vi.restoreAllMocks());

  it('puts projected content in front of the field instead of the demo', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await render(WithContent);

    expect(screen.getByRole('heading', { level: 2, name: 'Our own headline' })).toBeVisible();
    expect(screen.queryByText('Your content. Your code.')).not.toBeInTheDocument();
  });

  it('hides the field from assistive technology', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { container } = await render(BgGlyphField);

    expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('under reduced motion, redraws only when the pointer moves', async () => {
    const context = stubContext();
    preferReducedMotion(true);
    const { container } = await render(BgGlyphField);
    const section = container.querySelector('section')!;

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(context.clearRect).toHaveBeenCalledTimes(1);

    section.dispatchEvent(new MouseEvent('pointermove', { clientX: 50, clientY: 50 }));
    expect(context.clearRect).toHaveBeenCalledTimes(2);
  });

  it('lets go of the pointer and the animation when destroyed', async () => {
    const context = stubContext();
    preferReducedMotion(true);
    const { container, fixture } = await render(BgGlyphField);
    const section = container.querySelector('section')!;

    fixture.destroy();
    section.dispatchEvent(new MouseEvent('pointermove', { clientX: 50, clientY: 50 }));

    expect(context.clearRect).toHaveBeenCalledTimes(1);
  });
});
