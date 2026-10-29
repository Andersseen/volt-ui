import { render, screen, within } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { FeatureShowcase } from './feature-showcase';

describe('FeatureShowcase', () => {
  it('gives the first feature the large cell and the rest the small ones', async () => {
    await render(FeatureShowcase);
    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(4);
    expect(items[0].className).toContain('col-span-2');
    for (const item of items.slice(1)) expect(item.className).not.toContain('col-span-2');
  });

  it('reads its features from the input, in order', async () => {
    await render(FeatureShowcase, {
      inputs: {
        heading: 'Why us',
        features: [
          { title: 'Alpha', description: 'First.', visual: 'code' },
          { title: 'Beta', description: 'Second.', visual: 'people', badge: 'New' },
        ],
      },
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Why us' })).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole('heading', { name: 'Alpha' })).toBeInTheDocument();
    expect(within(items[1]).getByText('New')).toBeInTheDocument();
  });

  it('keeps the decorative drawings out of the accessibility tree', async () => {
    const { container } = await render(FeatureShowcase);
    const drawings = container.querySelectorAll('[aria-hidden="true"]');

    expect(drawings.length).toBeGreaterThan(0);
    // Nothing focusable hides inside them.
    for (const drawing of Array.from(drawings)) {
      expect(drawing.querySelector('a, button, input, [tabindex]')).toBeNull();
    }
  });
});
