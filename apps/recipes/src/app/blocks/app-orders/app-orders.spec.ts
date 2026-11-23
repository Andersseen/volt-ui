import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppOrders } from './app-orders';

const bodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);

describe('AppOrders', () => {
  it('lists every order with the count and total in a polite live region', async () => {
    await render(AppOrders);

    expect(bodyRows()).toHaveLength(8);
    const summary = screen.getByText(/8 of 8 orders/);
    expect(summary).toHaveAttribute('aria-live', 'polite');
    expect(summary).toHaveTextContent('$3,721.00');
  });

  it('combines the status filter and the search', async () => {
    const user = userEvent.setup();
    await render(AppOrders);

    await user.click(screen.getByRole('radio', { name: 'Pending' }));
    expect(bodyRows()).toHaveLength(2);

    await user.type(screen.getByRole('searchbox', { name: 'Search orders' }), 'liam');
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByText(/1 of 8 orders/)).toHaveTextContent('$120.00');
  });

  it('offers to clear the filters when nothing matches, and clearing restores the table', async () => {
    const user = userEvent.setup();
    await render(AppOrders);

    await user.type(screen.getByRole('searchbox', { name: 'Search orders' }), 'nobody');
    expect(screen.queryByRole('table')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(bodyRows()).toHaveLength(8);
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('data-selected');
  });
});
