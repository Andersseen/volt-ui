import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SwapStory } from './swap-story';

describe('SwapStory', () => {
  afterEach(() => vi.restoreAllMocks());

  it('tells the story as chapters, each with its own described photo', async () => {
    await render(SwapStory);

    const chapters = screen.getAllByRole('article');
    expect(chapters).toHaveLength(4);
    expect(screen.getByRole('article', { name: 'See it from above' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /aerial view/i })).toBeInTheDocument();
  });

  it('alternates the side of every other chapter', async () => {
    await render(SwapStory);

    const reversed = screen.getAllByRole('article').map(row => row.classList.contains('reverse'));
    expect(reversed).toEqual([false, true, false, true]);
  });

  it('keeps the travelling photo out of the accessibility tree', async () => {
    const { fixture } = await render(SwapStory);
    const stage = (fixture.nativeElement as HTMLElement).querySelector('.stage')!;

    expect(stage).toHaveAttribute('aria-hidden', 'true');
    for (const image of stage.querySelectorAll('img')) {
      expect(image).toHaveAttribute('alt', '');
    }
  });

  it('leaves the inline photos in charge until the sticky one is ready', async () => {
    // jsdom has no layout and decodes no image, so the sticky photo never takes over.
    const { fixture } = await render(SwapStory);
    await fixture.whenStable();

    const stage = (fixture.nativeElement as HTMLElement).querySelector('.stage')!;
    expect(stage.hasAttribute('data-ready')).toBe(false);
    expect(stage.textContent).toContain('01');
    expect(stage.textContent).toContain('Walk it first');
  });
});
