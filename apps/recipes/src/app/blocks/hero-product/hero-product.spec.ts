import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HeroProduct } from './hero-product';

describe('HeroProduct', () => {
  it('renders the copy it is given instead of fixed product text', async () => {
    await render(HeroProduct, {
      inputs: {
        eyebrow: 'Beta',
        headline: 'Plan less, ship more.',
        description: 'A board.',
        primaryLabel: 'Get going',
        secondaryLabel: 'Talk to us',
      },
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Plan less, ship more.' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Get going' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Talk to us' })).toBeInTheDocument();
  });

  it('emits from its two actions instead of navigating', async () => {
    const primary = vi.fn();
    const secondary = vi.fn();
    await render(HeroProduct, { on: { primary, secondary } });

    await userEvent.click(screen.getByRole('button', { name: 'Start for free' }));
    await userEvent.click(screen.getByRole('button', { name: 'Book a demo' }));

    expect(primary).toHaveBeenCalledTimes(1);
    expect(secondary).toHaveBeenCalledTimes(1);
  });

  it('moves the progress when a task is ticked, in the preview itself', async () => {
    await render(HeroProduct);
    expect(screen.getByText('1 of 4 complete')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('switch', { name: 'Mark Ship the billing webhook as done' })
    );

    expect(screen.getByText('2 of 4 complete')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('filters the list from the toggle group', async () => {
    await render(HeroProduct);

    await userEvent.click(screen.getByRole('radio', { name: 'Done' }));

    expect(screen.getByText('Review the migration plan')).toBeInTheDocument();
    expect(screen.queryByText('Ship the billing webhook')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Open' }));
    expect(screen.queryByText('Review the migration plan')).not.toBeInTheDocument();
  });
});
