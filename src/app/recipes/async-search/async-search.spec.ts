import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AsyncSearchRecipe, type Person, type SearchPeople } from './async-search';

const ADA: Person = { id: '1', name: 'Ada Lovelace', role: 'Analyst' };
const ALAN: Person = { id: '2', name: 'Alan Turing', role: 'Mathematician' };

/** Each call is a promise the test settles whenever it likes, in any order. */
function manual() {
  const pending: Record<string, { resolve: (p: Person[]) => void; reject: (e: Error) => void }> =
    {};
  const search = vi.fn<SearchPeople>(
    query =>
      new Promise((resolve, reject) => {
        pending[query] = { resolve, reject };
      })
  );
  return { search, pending };
}

async function setup() {
  const { search, pending } = manual();
  const { fixture } = await render(AsyncSearchRecipe, { inputs: { search, debounceMs: 0 } });
  const user = userEvent.setup();
  const box = screen.getByRole('combobox', { name: 'Owner' });
  return { search, pending, box, user, fixture };
}

const status = () => screen.getByRole('status');

describe('Async search recipe (remote VoltCombobox)', () => {
  it('goes idle → loading → results, announced through one live region', async () => {
    const { pending, user, box } = await setup();

    await user.click(box);
    expect(status()).toHaveTextContent('');

    await user.type(box, 'a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    expect(status()).toHaveTextContent('Searching…');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');

    pending['a'].resolve([ADA, ALAN]);
    await waitFor(() => expect(status()).toHaveTextContent('2 people found'));
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('never lets an older response replace a newer one', async () => {
    const { pending, user, box, fixture } = await setup();

    await user.type(box, 'a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    await user.type(box, 'l');
    await waitFor(() => expect(pending['al']).toBeDefined());

    // B ("al") finishes first, then A ("a") finishes late with a bigger list.
    pending['al'].resolve([ALAN]);
    await waitFor(() => expect(status()).toHaveTextContent('1 person found'));
    pending['a'].resolve([ADA, ALAN]);
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(status()).toHaveTextContent('1 person found');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('says so when nothing matches, using the query', async () => {
    const { pending, user, box } = await setup();
    await user.type(box, 'zzz');
    await waitFor(() => expect(pending['zzz']).toBeDefined());
    pending['zzz'].resolve([]);

    await waitFor(() => expect(status()).toHaveTextContent('No one matches "zzz".'));
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('does not filter server results a second time by their label', async () => {
    const { pending, user, box } = await setup();
    await user.type(box, 'turing');
    await waitFor(() => expect(pending['turing']).toBeDefined());
    // The server matched on something other than the name; the label does not contain "turing".
    pending['turing'].resolve([{ id: '9', name: 'A. M. T.', role: 'Alias match' }]);

    expect(await screen.findByRole('option', { name: /A\. M\. T\./ })).toBeInTheDocument();
  });

  it('reports an error and retries the same query', async () => {
    const { search, pending, user, box } = await setup();
    await user.type(box, 'boom');
    await waitFor(() => expect(pending['boom']).toBeDefined());
    pending['boom'].reject(new Error('The directory is unavailable.'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The directory is unavailable.');

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(search).toHaveBeenCalledTimes(5); // b, bo, boo, boom, then the retry
    expect(search).toHaveBeenLastCalledWith('boom');
    pending['boom'].resolve([ADA]);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('selects with the keyboard and does not search again for the echoed label', async () => {
    const { search, pending, user, box } = await setup();

    await user.type(box, 'a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    pending['a'].resolve([ADA, ALAN]);
    await screen.findByRole('option', { name: /Ada Lovelace/ });

    await user.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByTestId('selection')).toHaveTextContent('Selected: Alan Turing');
    expect(box).toHaveValue('Alan Turing');
    // Give a (wrongly) echoed query time to start a request.
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('keeps the selection through an empty search, an error, and clearing the box', async () => {
    const { pending, user, box } = await setup();

    await user.type(box, 'a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    pending['a'].resolve([ADA, ALAN]);
    await user.click(await screen.findByRole('option', { name: /Ada Lovelace/ }));
    expect(screen.getByTestId('selection')).toHaveTextContent('Selected: Ada Lovelace');

    // Emptying the box starts a new query; it does not unselect anybody.
    await user.clear(box);
    expect(screen.getByTestId('selection')).toHaveTextContent('Selected: Ada Lovelace');

    await user.type(box, 'boom');
    await waitFor(() => expect(pending['boom']).toBeDefined());
    pending['boom'].reject(new Error('down'));
    await screen.findByRole('alert');
    expect(screen.getByTestId('selection')).toHaveTextContent('Selected: Ada Lovelace');

    await user.clear(box);
    expect(screen.getByTestId('selection')).toHaveTextContent('Selected: Ada Lovelace');
  });

  it('keeps the same input element (and so focus) across loading changes', async () => {
    const { pending, user, box } = await setup();
    await user.type(box, 'a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    pending['a'].resolve([ADA]);
    await screen.findByRole('option', { name: /Ada Lovelace/ });

    expect(screen.getByRole('combobox', { name: 'Owner' })).toBe(box);
    expect(box).toHaveFocus();
  });

  it('ignores a response that arrives after the component is destroyed', async () => {
    const { pending, user, box, fixture } = await setup();
    await user.type(box, 'a');
    await waitFor(() => expect(pending['a']).toBeDefined());

    fixture.destroy();
    expect(() => pending['a'].resolve([ADA])).not.toThrow();
  });
});
