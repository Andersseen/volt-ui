import { render } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureBento } from './feature-bento';

const stubCardBox = () =>
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 20,
    top: 10,
    width: 300,
    height: 200,
  } as DOMRect);

describe('FeatureBento', () => {
  afterEach(() => vi.restoreAllMocks());

  it('tracks the pointer on the card under it, and leaves the others alone', async () => {
    stubCardBox();
    const { fixture } = await render(FeatureBento);
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      '.bento-card'
    );

    cards[1].dispatchEvent(
      new MouseEvent('pointermove', { clientX: 120, clientY: 60, bubbles: true })
    );

    expect(cards[1].style.getPropertyValue('--gx')).toBe('100px');
    expect(cards[1].style.getPropertyValue('--gy')).toBe('50px');
    expect(cards[0].style.getPropertyValue('--gx')).toBe('');
  });

  it('gives every feature a heading and a body', async () => {
    const { getByRole, getAllByRole } = await render(FeatureBento);

    expect(getByRole('heading', { level: 2, name: /everything you need/i })).toBeInTheDocument();
    expect(getAllByRole('heading', { level: 3 })).toHaveLength(5);
  });

  it('only shows the technique tags on the card wide enough to hold them', async () => {
    const { fixture } = await render(FeatureBento);
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('.bento-card');

    expect(cards[0].querySelectorAll('li').length).toBeGreaterThan(0);
    expect(cards[1].querySelectorAll('li')).toHaveLength(0);
  });
});
