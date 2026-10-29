import { render } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroSpotlight } from './hero-spotlight';

/** jsdom lays nothing out, so the handler's percentage maths needs a real box to divide by. */
const stubHostBox = () =>
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    top: 50,
    width: 800,
    height: 400,
  } as DOMRect);

const pointer = (type: string, clientX: number, clientY: number) =>
  new MouseEvent(type, { clientX, clientY, bubbles: true });

describe('HeroSpotlight', () => {
  afterEach(() => vi.restoreAllMocks());

  it('moves the spotlight to the pointer, in host-relative percentages', async () => {
    stubHostBox();
    const { fixture } = await render(HeroSpotlight);
    const host = fixture.nativeElement as HTMLElement;

    // 300px into an 800px-wide box is 37.5%; 150px into a 400px-tall one is the same.
    host.dispatchEvent(pointer('pointermove', 400, 200));

    expect(host.style.getPropertyValue('--spot-x')).toBe('37.5%');
    expect(host.style.getPropertyValue('--spot-y')).toBe('37.5%');
  });

  it('parks the spotlight back at the top centre when the pointer leaves', async () => {
    stubHostBox();
    const { fixture } = await render(HeroSpotlight);
    const host = fixture.nativeElement as HTMLElement;

    host.dispatchEvent(pointer('pointermove', 900, 450));
    host.dispatchEvent(new MouseEvent('pointerleave', { bubbles: true }));

    expect(host.style.getPropertyValue('--spot-x')).toBe('50%');
    expect(host.style.getPropertyValue('--spot-y')).toBe('0%');
  });

  it('offers both calls to action as buttons', async () => {
    const { getByRole } = await render(HeroSpotlight);

    expect(getByRole('button', { name: /start building/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /browse blocks/i })).toBeInTheDocument();
  });

  it('hides the decorative layers from assistive technology', async () => {
    const { fixture } = await render(HeroSpotlight);
    const host = fixture.nativeElement as HTMLElement;

    const decorations = host.querySelectorAll('.hero-grid, .hero-aurora, .hero-spotlight');

    expect(decorations.length).toBe(4);
    for (const layer of decorations) {
      expect(layer.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
