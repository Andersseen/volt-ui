import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
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
  const box = screen.getByRole('combobox', { name: 'Owner' });
  // The recipe listens to the native input event, exactly as a user's typing produces it.
  const type = (value: string) => {
    (box as HTMLInputElement).value = value;
    fireEvent.input(box, { target: { value } });
  };
  return { search, pending, box, type, fixture };
}

describe('Async search recipe', () => {
  it('goes idle → loading → results', async () => {
    const { pending, type } = await setup();
    expect(screen.getByRole('status')).toHaveTextContent('');

    type('a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    expect(screen.getByRole('status')).toHaveTextContent('Searching…');

    pending['a'].resolve([ADA, ALAN]);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('2 people found'));
  });

  it('never lets an older response replace a newer one', async () => {
    const { pending, type, fixture } = await setup();

    type('a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    type('al');
    await waitFor(() => expect(pending['al']).toBeDefined());

    // B ("al") finishes first, then A ("a") finishes late with a bigger list.
    pending['al'].resolve([ALAN]);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 person found'));
    pending['a'].resolve([ADA, ALAN]);
    // Let the late response run its continuation and the view settle before asserting.
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByRole('status')).toHaveTextContent('1 person found');
    expect(screen.getByRole('status')).not.toHaveTextContent('2 people');
  });

  it('says so when nothing matches', async () => {
    const { pending, type } = await setup();
    type('zzz');
    await waitFor(() => expect(pending['zzz']).toBeDefined());
    pending['zzz'].resolve([]);

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('No one matches "zzz".')
    );
  });

  it('reports an error and retries the same query', async () => {
    const { search, pending, type } = await setup();
    type('boom');
    await waitFor(() => expect(pending['boom']).toBeDefined());
    pending['boom'].reject(new Error('The directory is unavailable.'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The directory is unavailable.');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));
    expect(search).toHaveBeenCalledTimes(2);
    expect(search).toHaveBeenLastCalledWith('boom');
    pending['boom'].resolve([ADA]);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(screen.getByRole('status')).toHaveTextContent('1 person found');
  });

  it('keeps the selection through an empty search, an error, and clearing the box', async () => {
    const { pending, type, box } = await setup();
    const user = userEvent.setup();

    type('a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    pending['a'].resolve([ADA, ALAN]);
    await screen.findByText('2 people found');

    await user.click(await screen.findByRole('option', { name: /Ada Lovelace/ }));
    expect(screen.getByTestId('selection')).toHaveTextContent('Selected: Ada Lovelace');

    type('boom');
    await waitFor(() => expect(pending['boom']).toBeDefined());
    pending['boom'].reject(new Error('down'));
    await screen.findByRole('alert');
    expect(screen.getByTestId('selection')).toHaveTextContent('Selected: Ada Lovelace');

    type('');
    expect(screen.getByTestId('selection')).toHaveTextContent('Selected: Ada Lovelace');
    expect(box).toBeInTheDocument();
  });

  it('keeps the same input element (and so focus) across loading changes', async () => {
    const { pending, type, box } = await setup();
    box.focus();

    type('a');
    await waitFor(() => expect(pending['a']).toBeDefined());
    pending['a'].resolve([ADA]);
    await screen.findByText('1 person found');

    expect(screen.getByRole('combobox', { name: 'Owner' })).toBe(box);
    expect(box).toHaveFocus();
  });

  it('ignores a response that arrives after the component is destroyed', async () => {
    const { search, pending } = manual();
    const { fixture } = await render(AsyncSearchRecipe, { inputs: { search, debounceMs: 0 } });
    const box = screen.getByRole('combobox', { name: 'Owner' });
    fireEvent.input(box, { target: { value: 'a' } });
    await waitFor(() => expect(pending['a']).toBeDefined());

    fixture.destroy();
    expect(() => pending['a'].resolve([ADA])).not.toThrow();
  });
});
