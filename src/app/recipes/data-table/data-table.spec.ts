import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {
  DataTableRecipe,
  type FetchInvoices,
  type Invoice,
  type InvoicePage,
  type InvoiceQuery,
} from './data-table';

const ROWS: Invoice[] = [
  { id: '1', customer: 'Acme', status: 'paid', amount: 10 },
  { id: '2', customer: 'Borealis', status: 'pending', amount: 20 },
  { id: '3', customer: 'Cinder', status: 'overdue', amount: 30 },
  { id: '4', customer: 'Delta', status: 'paid', amount: 40 },
];

/** An in-memory API that answers immediately, so state changes are the only thing under test. */
function api(rows: Invoice[] = ROWS) {
  const fetch = vi.fn<FetchInvoices>(async (q: InvoiceQuery): Promise<InvoicePage> => {
    const f = q.filter.toLowerCase();
    const matches = rows.filter(r => r.customer.toLowerCase().includes(f));
    const sorted = [...matches].sort((a, b) => {
      const order = q.sort === 'amount' ? a.amount - b.amount : a[q.sort].localeCompare(b[q.sort]);
      return q.direction === 'asc' ? order : -order;
    });
    return {
      rows: sorted.slice((q.page - 1) * q.pageSize, q.page * q.pageSize),
      total: sorted.length,
      datasetSize: rows.length,
    };
  });
  return fetch;
}

const customers = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(row => within(row).getAllByRole('cell')[0].textContent!.trim());

describe('Data table recipe', () => {
  it('shows skeletons on the first load, then the data', async () => {
    let release!: (page: InvoicePage) => void;
    const fetch = vi.fn<FetchInvoices>(() => new Promise(resolve => (release = resolve)));
    await render(DataTableRecipe, { inputs: { fetch } });

    expect(screen.getByText('Loading invoices…')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();

    release({ rows: ROWS.slice(0, 3), total: 4, datasetSize: 4 });
    await waitFor(() => expect(customers()).toEqual(['Acme', 'Borealis', 'Cinder']));
    expect(screen.queryByText('Loading invoices…')).toBeNull();
  });

  it('exposes sort state with aria-sort and toggles direction', async () => {
    const user = userEvent.setup();
    await render(DataTableRecipe, { inputs: { fetch: api() } });
    await screen.findByRole('table');

    const header = (name: string) => screen.getByRole('columnheader', { name });
    expect(header('Customer')).toHaveAttribute('aria-sort', 'ascending');
    expect(header('Amount')).toHaveAttribute('aria-sort', 'none');

    await user.click(within(header('Customer')).getByRole('button'));
    await waitFor(() => expect(header('Customer')).toHaveAttribute('aria-sort', 'descending'));
    await waitFor(() => expect(customers()[0]).toBe('Delta'));

    await user.click(within(header('Amount')).getByRole('button'));
    await waitFor(() => expect(header('Amount')).toHaveAttribute('aria-sort', 'ascending'));
    expect(header('Customer')).toHaveAttribute('aria-sort', 'none');
  });

  it('filters, resets to page 1, and clamps a page that no longer exists', async () => {
    const user = userEvent.setup();
    await render(DataTableRecipe, { inputs: { fetch: api() } });
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(customers()).toEqual(['Delta']));

    await user.type(screen.getByRole('textbox', { name: 'Filter invoices by customer' }), 'a');
    await waitFor(() => expect(customers().length).toBeGreaterThan(0));
    // "a" matches Acme, Borealis, Delta, Cinder? (no) — whatever the count, we are on page 1.
    expect(customers()[0]).toBe('Acme');
  });

  it('tells an empty dataset from a filter with no matches', async () => {
    const user = userEvent.setup();
    await render(DataTableRecipe, { inputs: { fetch: api() } });
    await screen.findByRole('table');

    await user.type(screen.getByRole('textbox', { name: 'Filter invoices by customer' }), 'zzz');
    expect(await screen.findByText('No invoices match "zzz"')).toBeInTheDocument();
    expect(screen.queryByText('No invoices yet')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Clear filter' }));
    await waitFor(() => expect(customers()).toContain('Acme'));
  });

  it('shows the empty-dataset state with an action', async () => {
    await render(DataTableRecipe, { inputs: { fetch: api([]) } });

    expect(await screen.findByText('No invoices yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add invoice' })).toBeInTheDocument();
  });

  it('reports a failure, keeps stale rows, and recovers on retry', async () => {
    const user = userEvent.setup();
    const ok = api();
    let fail = false;
    const fetch = vi.fn<FetchInvoices>(q => (fail ? Promise.reject(new Error('503')) : ok(q)));
    await render(DataTableRecipe, { inputs: { fetch } });
    await screen.findByRole('table');

    fail = true;
    await user.type(screen.getByRole('textbox', { name: 'Filter invoices by customer' }), 'a');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('503');
    // The rows the user was reading are still there.
    expect(customers().length).toBeGreaterThan(0);

    fail = false;
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('keeps the previous rows (dimmed, busy) while reloading instead of flashing a skeleton', async () => {
    const user = userEvent.setup();
    const ok = api();
    let gate: (() => void) | null = null;
    const fetch = vi.fn<FetchInvoices>(
      q =>
        new Promise(resolve => {
          if (gate === null && fetch.mock.calls.length > 1) {
            gate = () => resolve(ok(q) as never);
          } else {
            resolve(ok(q) as never);
          }
        })
    );
    await render(DataTableRecipe, { inputs: { fetch } });
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: /next/i }));
    const region = screen.getByRole('region', { name: 'Invoices' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(customers()).toEqual(['Acme', 'Borealis', 'Cinder']);

    gate!();
    await waitFor(() => expect(region).toHaveAttribute('aria-busy', 'false'));
    expect(customers()).toEqual(['Delta']);
  });

  it('makes the scroll container keyboard-reachable and named', async () => {
    await render(DataTableRecipe, { inputs: { fetch: api() } });
    await screen.findByRole('table');

    const region = screen.getByRole('region', { name: 'Invoices' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveClass('overflow-x-auto');
  });
});
