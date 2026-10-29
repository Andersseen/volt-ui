import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroGlyphs } from './hero-glyphs';

/** jsdom has no 2D canvas; a recording stub is enough to see whether the field drew. */
const stubContext = () => {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 360,
    height: 180,
  } as DOMRect);
  return context;
};

const preferReducedMotion = (reduce: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduce } as MediaQueryList);

describe('HeroGlyphs', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps each headline line it is given as its own line', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await render(HeroGlyphs, { inputs: { headline: ['Ship it.', 'Own it.'] } });

    const heading = screen.getByRole('heading', { level: 1, name: 'Ship it. Own it.' });
    expect(heading.children).toHaveLength(2);
  });

  it('emits from its two actions instead of navigating', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const primary = vi.fn();
    const secondary = vi.fn();
    await render(HeroGlyphs, { on: { primary, secondary } });

    await userEvent.click(screen.getByRole('button', { name: 'Start building' }));
    await userEvent.click(screen.getByRole('button', { name: 'Explore the live demo' }));

    expect(primary).toHaveBeenCalledTimes(1);
    expect(secondary).toHaveBeenCalledTimes(1);
  });

  it('lists the stack it is given', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await render(HeroGlyphs, { inputs: { stack: ['Postgres', 'S3'] } });

    expect(screen.getAllByRole('listitem').map(item => item.textContent?.trim())).toEqual([
      'Postgres',
      'S3',
    ]);
  });

  it('hides the field from assistive technology', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { container } = await render(HeroGlyphs);

    expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the field once and never animates it under reduced motion', async () => {
    const context = stubContext();
    preferReducedMotion(true);

    await render(HeroGlyphs);
    const drawn = vi.mocked(context.clearRect).mock.calls.length;
    // Several frames' worth of time: an animating field would have cleared and redrawn.
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(context.fillText).toHaveBeenCalled();
    expect(drawn).toBe(1);
    expect(context.clearRect).toHaveBeenCalledTimes(1);
  });

  it('stops animating when the hero is destroyed', async () => {
    stubContext();
    preferReducedMotion(false);
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(7);
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');

    const { fixture } = await render(HeroGlyphs);
    fixture.destroy();

    expect(cancel).toHaveBeenCalledWith(7);
  });
});
