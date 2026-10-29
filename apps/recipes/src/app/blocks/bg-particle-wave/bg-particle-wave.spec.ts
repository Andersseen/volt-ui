import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BgParticleWave } from './bg-particle-wave';

const stubContext = () => {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 320,
    height: 200,
  } as DOMRect);
  return context;
};

const preferReducedMotion = (reduce: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduce } as MediaQueryList);

@Component({
  imports: [BgParticleWave],
  template: `<app-bg-particle-wave><h2>Our own headline</h2></app-bg-particle-wave>`,
})
class WithContent {}

describe('BgParticleWave', () => {
  afterEach(() => vi.restoreAllMocks());

  it('puts projected content in front of the field instead of the demo', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await render(WithContent);

    expect(screen.getByRole('heading', { level: 2, name: 'Our own headline' })).toBeVisible();
    expect(screen.queryByText('Motion that follows your state.')).not.toBeInTheDocument();
  });

  it('hides the field from assistive technology', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { container } = await render(BgParticleWave);

    expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the ribbons once and holds them still under reduced motion', async () => {
    const context = stubContext();
    preferReducedMotion(true);

    await render(BgParticleWave);
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(context.fillRect).toHaveBeenCalled();
    expect(context.clearRect).toHaveBeenCalledTimes(1);
  });

  it('stops animating when the section is destroyed', async () => {
    stubContext();
    preferReducedMotion(false);
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(11);
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');

    const { fixture } = await render(BgParticleWave);
    fixture.destroy();

    expect(cancel).toHaveBeenCalledWith(11);
  });
});
