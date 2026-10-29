import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureCarousel } from './feature-carousel';

const CARD_STEP = 300;

/**
 * jsdom lays nothing out. Give each card a position, and give the track a scroll position
 * that `scrollBy` really moves, so the component measures what a browser would report.
 */
const layOut = (track: HTMLElement, visibleCards: number) => {
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
    this: HTMLElement
  ) {
    return Array.from(this.parentElement?.children ?? []).indexOf(this) * CARD_STEP;
  });

  const cards = track.querySelectorAll('li').length;
  let scrollLeft = 0;
  Object.defineProperties(track, {
    scrollLeft: { get: () => scrollLeft, configurable: true },
    clientWidth: { value: visibleCards * CARD_STEP, configurable: true },
    scrollWidth: { value: cards * CARD_STEP, configurable: true },
  });
  track.scrollBy = (({ left = 0 }: ScrollToOptions) => {
    scrollLeft = Math.max(0, Math.min(scrollLeft + left, (cards - visibleCards) * CARD_STEP));
    track.dispatchEvent(new Event('scroll'));
  }) as typeof track.scrollBy;
  track.dispatchEvent(new Event('scroll'));
};

const track = () => screen.getByRole('region', { name: "Built for state. Here's why." });
const front = () =>
  screen.getAllByRole('listitem').find(card => card.getAttribute('aria-current') === 'true');

describe('FeatureCarousel', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders every reason as a list item inside a focusable region', async () => {
    await render(FeatureCarousel);

    expect(track()).toHaveAttribute('tabindex', '0');
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('pages one card at a time and puts the first card in view in front', async () => {
    await render(FeatureCarousel);
    layOut(track(), 2);
    const next = screen.getByRole('button', { name: 'Next' });
    const previous = screen.getByRole('button', { name: 'Previous' });

    expect(previous).toBeDisabled();
    expect(front()).toHaveTextContent('Signals in, motion out');

    await userEvent.click(next);
    expect(front()).toHaveTextContent('Native browser animation');
    expect(previous).toBeEnabled();

    await userEvent.click(next);
    expect(front()).toHaveTextContent('Presence that owns lifetime');
    expect(next).toBeDisabled();

    await userEvent.click(previous);
    expect(front()).toHaveTextContent('Native browser animation');
    expect(next).toBeEnabled();
  });

  it('follows scrolling that did not come from its buttons', async () => {
    const { fixture } = await render(FeatureCarousel);
    const region = track();
    layOut(region, 1);

    region.scrollBy({ left: CARD_STEP * 3 });
    await fixture.whenStable();

    expect(front()).toHaveTextContent('Safe on the server');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('points both arrows at the track they move', async () => {
    await render(FeatureCarousel);
    const id = track().id;

    expect(id).not.toBe('');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute('aria-controls', id);
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveAttribute('aria-controls', id);
  });

  it('hands the chosen reason to its link', async () => {
    const learnMore = vi.fn();
    await render(FeatureCarousel, { on: { learnMore } });

    await userEvent.click(screen.getByRole('button', { name: 'Presence guide' }));

    expect(learnMore).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Presence that owns lifetime' })
    );
  });
});
