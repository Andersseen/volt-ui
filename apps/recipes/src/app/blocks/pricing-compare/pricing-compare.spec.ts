import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PricingCompare } from './pricing-compare';

describe('PricingCompare', () => {
  it('is a table of features against plans, with spoken checks and dashes', async () => {
    await render(PricingCompare);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
    expect(within(table).getAllByRole('row')).toHaveLength(7);
    expect(within(table).getAllByText('Included').length).toBeGreaterThan(0);
    expect(within(table).getAllByText('Not included').length).toBeGreaterThan(0);
  });

  it('scrolls inside its own focusable, labelled region', async () => {
    await render(PricingCompare);

    const region = screen.getByRole('region', { name: 'Plan comparison' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toContainElement(screen.getByRole('table'));
  });

  it('highlights the column of the plan picked under "Compare for"', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(PricingCompare);
    const host = fixture.nativeElement as HTMLElement;
    const highlighted = () =>
      Array.from(host.querySelectorAll('volt-table-head[data-highlight]')).map(node =>
        node.textContent?.trim()
      );

    expect(highlighted()[0]).toContain('Team');

    await user.click(screen.getByRole('radio', { name: 'Scale' }));

    expect(highlighted()[0]).toContain('Scale');
    expect(host.querySelectorAll('volt-table-cell[data-highlight]')).toHaveLength(6);
    expect(screen.getByRole('link', { name: 'Start with Scale' })).toBeInTheDocument();
  });
});
