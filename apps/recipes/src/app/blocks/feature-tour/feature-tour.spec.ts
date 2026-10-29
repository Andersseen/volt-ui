import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FeatureTour, type TourStep } from './feature-tour';

const panel = () => screen.getByRole('tabpanel');

describe('FeatureTour', () => {
  it('opens on the first step, with its narrative and its snippet', async () => {
    await render(FeatureTour);

    expect(screen.getByRole('tab', { name: 'Hover & press' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Feel it under the pointer' })
    ).toBeVisible();
    expect(screen.getByText('01 · Hover & press')).toBeInTheDocument();
    expect(within(panel()).getByText('save-button.html')).toBeInTheDocument();
  });

  it('moves the narrative with the selected tab', async () => {
    await render(FeatureTour);

    await userEvent.click(screen.getByRole('tab', { name: 'Presence' }));

    expect(screen.getByRole('heading', { level: 3, name: 'Arrive without a jump' })).toBeVisible();
    expect(screen.getByText('03 · Presence')).toBeInTheDocument();
  });

  it('runs the demo in the panel, not a recording of it', async () => {
    await render(FeatureTour);

    await userEvent.click(within(panel()).getByRole('button', { name: 'Hover or press me' }));
    await userEvent.click(within(panel()).getByRole('button', { name: 'Hover or press me' }));
    expect(within(panel()).getByText('Pressed 2×')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'State' }));
    await userEvent.click(within(panel()).getByRole('switch', { name: 'Enable sync' }));
    expect(within(panel()).getByText('active')).toBeInTheDocument();
  });

  it('adds and removes rows in the presence demo', async () => {
    await render(FeatureTour);
    await userEvent.click(screen.getByRole('tab', { name: 'Presence' }));
    const rows = () =>
      within(within(panel()).getByRole('list', { name: 'Rows' })).queryAllByRole('listitem');

    expect(rows()).toHaveLength(2);
    await userEvent.click(within(panel()).getByRole('button', { name: 'Add row' }));
    expect(rows().map(row => row.textContent?.trim())).toEqual(['Row 1', 'Row 2', 'Row 3']);

    await userEvent.click(within(panel()).getByRole('button', { name: 'Remove' }));
    expect(rows().map(row => row.textContent?.trim())).toEqual(['Row 2', 'Row 3']);
  });

  it('hands the current step to its two actions', async () => {
    const guide = vi.fn();
    const playground = vi.fn();
    await render(FeatureTour, { on: { guide, playground } });

    await userEvent.click(screen.getByRole('tab', { name: 'Stagger' }));
    await userEvent.click(screen.getByRole('button', { name: 'Read the guide' }));
    await userEvent.click(screen.getByRole('button', { name: 'Open playground' }));

    expect(guide).toHaveBeenCalledWith(expect.objectContaining({ id: 'stagger' }));
    expect(playground).toHaveBeenCalledWith(expect.objectContaining({ id: 'stagger' }));
  });

  it('builds its tabs from the steps it is given', async () => {
    const steps: TourStep[] = [
      {
        id: 'a',
        label: 'Alpha',
        title: 'First',
        body: 'One',
        demo: 'press',
        file: 'a.html',
        code: 'a',
      },
      {
        id: 'b',
        label: 'Beta',
        title: 'Second',
        body: 'Two',
        demo: 'state',
        file: 'b.html',
        code: 'b',
      },
    ];
    await render(FeatureTour, { inputs: { steps } });

    expect(screen.getAllByRole('tab').map(tab => tab.textContent?.trim())).toEqual([
      'Alpha',
      'Beta',
    ]);
    expect(screen.getByText('01 · Alpha')).toBeInTheDocument();
  });
});
