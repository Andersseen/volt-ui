import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltCombobox } from './combobox';

interface Person {
  id: number;
  name: string;
}

const ALICE: Person = { id: 1, name: 'Alice' };
const BOB: Person = { id: 2, name: 'Bob' };

/** A server-backed picker as an application writes it: the app owns the request, Volt renders. */
@Component({
  imports: [VoltCombobox, ReactiveFormsModule],
  template: `
    <volt-combobox
      label="Owner"
      filterMode="manual"
      [items]="results()"
      [loading]="loading()"
      [itemLabel]="label"
      [compareWith]="sameId"
      [trackByFn]="byId"
      [emptyText]="'No matches for ' + query()"
      [formControl]="control"
      (queryChange)="onQuery($event)"
    />
  `,
})
class RemoteHost {
  readonly results = signal<Person[]>([]);
  readonly loading = signal(false);
  readonly query = signal('');
  readonly queries: string[] = [];
  readonly control = new FormControl<Person | null>(null);
  readonly label = (item: unknown) => (item as Person).name;
  readonly sameId = (a: unknown, b: unknown) => (a as Person)?.id === (b as Person)?.id;
  readonly byId = (_i: number, item: unknown) => (item as Person).id;

  onQuery(value: string): void {
    this.queries.push(value);
    this.query.set(value);
  }
}

@Component({
  imports: [VoltCombobox],
  template: `<volt-combobox [items]="items" (queryChange)="queries.push($event)" />`,
})
class LocalHost {
  readonly items = ['Angular', 'React', 'Vue'];
  readonly queries: string[] = [];
}

const status = () => screen.getByRole('status');

describe('VoltCombobox — filterMode="manual"', () => {
  it('renders the items exactly as supplied, without filtering them by the typed text', async () => {
    const { fixture } = await render(RemoteHost);
    fixture.componentInstance.results.set([ALICE, BOB]);
    const input = screen.getByRole('combobox', { name: 'Owner' });

    await userEvent.click(input);
    // "zzz" matches neither label: a local filter would hide both rows.
    await userEvent.type(input, 'zzz');

    expect(screen.getAllByRole('option').map(o => o.textContent?.trim())).toEqual(['Alice', 'Bob']);
  });

  it('keeps filtering locally by default', async () => {
    const { fixture } = await render(LocalHost);
    const input = screen.getByRole('combobox');

    await userEvent.click(input);
    await userEvent.type(input, 're');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    // queryChange is available in local mode too: it is the typing, whoever filters.
    expect(fixture.componentInstance.queries).toEqual(['r', 're']);
  });

  it('emits queryChange for typing only, not when a selection writes its label back', async () => {
    const { fixture } = await render(RemoteHost);
    const host = fixture.componentInstance;
    const input = screen.getByRole('combobox', { name: 'Owner' });

    await userEvent.click(input);
    await userEvent.type(input, 'al');
    expect(host.queries).toEqual(['a', 'al']);

    host.results.set([ALICE]);
    await fixture.whenStable();
    await userEvent.click(screen.getByRole('option', { name: 'Alice' }));

    expect(input).toHaveValue('Alice');
    expect(host.control.value).toEqual(ALICE);
    // The label echoed into the input after selecting is not a new search.
    expect(host.queries).toEqual(['a', 'al']);
  });

  it('shows and announces loading, then the result count, through one live region', async () => {
    const { fixture } = await render(RemoteHost);
    const host = fixture.componentInstance;
    const input = screen.getByRole('combobox', { name: 'Owner' });

    // Opening an untouched list announces nothing: the active option speaks for itself.
    await userEvent.click(input);
    expect(status()).toHaveTextContent('');

    await userEvent.type(input, 'a');
    host.loading.set(true);
    await fixture.whenStable();
    expect(status()).toHaveTextContent('Loading…');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(document.querySelector('[data-combobox-loading]')).toHaveTextContent('Loading…');

    host.results.set([ALICE, BOB]);
    host.loading.set(false);
    await fixture.whenStable();
    expect(status()).toHaveTextContent('2 results available.');
    expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-busy');
    expect(document.querySelector('[data-combobox-loading]')).toBeNull();
    // The visible rows are not a second live region.
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('shows the consumer-supplied empty text when a query returns nothing', async () => {
    const { fixture } = await render(RemoteHost);
    const input = screen.getByRole('combobox', { name: 'Owner' });

    await userEvent.click(input);
    await userEvent.type(input, 'xyz');
    await fixture.whenStable();

    expect(document.querySelector('[data-combobox-empty]')).toHaveTextContent('No matches for xyz');
    expect(status()).toHaveTextContent('No matches for xyz');
  });

  it('does not show the empty row while loading', async () => {
    const { fixture } = await render(RemoteHost);
    fixture.componentInstance.loading.set(true);
    const input = screen.getByRole('combobox', { name: 'Owner' });

    await userEvent.click(input);
    await userEvent.type(input, 'a');

    expect(document.querySelector('[data-combobox-empty]')).toBeNull();
    expect(document.querySelector('[data-combobox-loading]')).not.toBeNull();
  });

  it('keeps the selection when later results no longer contain it', async () => {
    const { fixture } = await render(RemoteHost);
    const host = fixture.componentInstance;
    host.results.set([ALICE, BOB]);
    const input = screen.getByRole('combobox', { name: 'Owner' });

    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: 'Bob' }));
    expect(host.control.value).toEqual(BOB);

    await userEvent.click(input);
    await userEvent.type(input, 'ali');
    host.results.set([ALICE]);
    await fixture.whenStable();

    expect(host.control.value).toEqual(BOB);
    // Leaving the field without choosing puts the selection's label back.
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue('Bob'));
  });

  it('selects from supplied results with the keyboard and closes', async () => {
    const { fixture } = await render(RemoteHost);
    const host = fixture.componentInstance;
    const input = screen.getByRole('combobox', { name: 'Owner' });

    await userEvent.click(input);
    await userEvent.type(input, 'a');
    host.results.set([ALICE, BOB]);
    await fixture.whenStable();

    // The first result is active as soon as results land (as it is for a local list), so Enter
    // takes it and ArrowDown moves on from it.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(host.control.value).toEqual(BOB);
    expect(input).toHaveValue('Bob');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
