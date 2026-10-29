import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { ScrollStory } from './scroll-story';

describe('ScrollStory', () => {
  it('is one ordered list in story order, so reading order never depends on stacking', async () => {
    await render(ScrollStory, {
      inputs: {
        steps: [
          { title: 'One', body: 'a' },
          { title: 'Two', body: 'b' },
          { title: 'Three', body: 'c' },
        ],
      },
    });

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent!.trim())).toEqual([
      'Step 1: One',
      'Step 2: Two',
      'Step 3: Three',
    ]);
  });

  it('gives every card its own sticky offset index', async () => {
    const { container } = await render(ScrollStory);
    const steps = Array.from(container.querySelectorAll<HTMLElement>('li.step'));

    expect(steps.map(step => step.style.getPropertyValue('--i'))).toEqual(['0', '1', '2', '3']);
  });

  it('only stacks from md up and never under reduced motion — a CSS guarantee, checked in the source', async () => {
    // jsdom does not evaluate media queries, so assert the guard is where it must be. The
    // browser-level behaviour is covered in e2e/recipes/scroll-story.spec.ts.
    const source = (await import('./scroll-story.ts?raw')).default;
    expect(source).toMatch(
      /@media \(min-width: 768px\) and \(prefers-reduced-motion: no-preference\)\s*{\s*\.step\s*{\s*position: sticky/
    );
  });

  it('uses no scroll listeners, observers or timers', async () => {
    const source = (await import('./scroll-story.ts?raw')).default;
    expect(source).not.toMatch(
      /IntersectionObserver|addEventListener|requestAnimationFrame|setInterval/
    );
  });
});
