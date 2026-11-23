import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureGlowGrid } from './feature-glow-grid';

const move = (target: Element, clientX: number, clientY: number, pointerType = 'mouse') => {
  const event = new MouseEvent('pointermove', { clientX, clientY, bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  target.dispatchEvent(event);
};

describe('FeatureGlowGrid', () => {
  afterEach(() => vi.restoreAllMocks());

  it('lists six features, each with a heading', async () => {
    await render(FeatureGlowGrid);

    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
  });

  it('places the light on every card relative to its own box, and fades it on leave', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 1;
    });
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
    } as DOMRect);
    const { fixture } = await render(FeatureGlowGrid);
    const host = fixture.nativeElement as HTMLElement;
    const grid = screen.getByRole('list');
    const card = host.querySelector<HTMLElement>('.glow')!;

    move(grid, 130, 90);
    expect(card.style.getPropertyValue('--x')).toBe('30px');
    expect(card.style.getPropertyValue('--y')).toBe('40px');
    expect(card.style.getPropertyValue('--on')).toBe('1');

    grid.dispatchEvent(new MouseEvent('pointerleave'));
    expect(card.style.getPropertyValue('--on')).toBe('0');
  });

  it('ignores touch, where there is no pointer to follow', async () => {
    const { fixture } = await render(FeatureGlowGrid);
    const card = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.glow')!;

    move(screen.getByRole('list'), 10, 10, 'touch');
    expect(card.style.getPropertyValue('--on')).toBe('');
  });
});
