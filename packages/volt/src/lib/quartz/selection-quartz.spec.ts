import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  VoltListbox,
  VoltListboxHeader,
  VoltListboxOption,
  VoltListboxSection,
  VoltListboxTrigger,
} from './listbox';
import {
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
} from './select';

/*
 * What only the Quartz wrappers promise: the boundary adapters (value shapes, ids, overrides) and
 * the behaviour where Quartz 0.16.0 and ng-primitives knowingly differ. The shared contract lives
 * in `testing/selection-contract.ts`; these are the documented exceptions to it.
 */
const listboxImports = [
  VoltListbox,
  VoltListboxOption,
  VoltListboxSection,
  VoltListboxHeader,
  VoltListboxTrigger,
];
const selectImports = [
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
];

describe('Quartz listbox', () => {
  it('switches between single and multiple at runtime, keeping the array value', async () => {
    const mode = signal<'single' | 'multiple'>('multiple');
    const value = signal<string[]>(['a', 'b']);
    const { fixture } = await render(
      `<volt-listbox aria-label="x" [mode]="mode()" [(value)]="value">
         <volt-listbox-option value="a">A</volt-listbox-option>
         <volt-listbox-option value="b">B</volt-listbox-option>
       </volt-listbox>`,
      { imports: listboxImports, componentProperties: { mode, value } }
    );
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    expect(screen.getAllByRole('option').filter(o => o.ariaSelected === 'true')).toHaveLength(2);
    mode.set('single');
    await fixture.whenStable();
    expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-multiselectable', 'true');
    // Single mode shows the first written value only; the model is untouched until the user acts.
    expect(screen.getAllByRole('option').filter(o => o.ariaSelected === 'true')).toHaveLength(1);
    expect(value()).toEqual(['a', 'b']);
  });

  it('enters on the selected option and shows data-active only while focused', async () => {
    const user = userEvent.setup();
    await render(
      `<volt-listbox aria-label="x" [value]="['b']">
         <volt-listbox-option value="a">A</volt-listbox-option>
         <volt-listbox-option value="b">B</volt-listbox-option>
       </volt-listbox>`,
      { imports: listboxImports }
    );
    const b = screen.getByRole('option', { name: 'B' });
    expect(b).not.toHaveAttribute('data-active');
    await user.tab();
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-activedescendant', b.id);
    expect(b).toHaveAttribute('data-active');
    await user.tab();
    expect(b).not.toHaveAttribute('data-active');
  });

  it('applies a bound option id and keeps the active-descendant reference valid', async () => {
    const id = signal('custom-1');
    const user = userEvent.setup();
    await render(
      `<volt-listbox aria-label="x">
         <volt-listbox-option [id]="id()" value="a">A</volt-listbox-option>
         <volt-listbox-option value="b">B</volt-listbox-option>
       </volt-listbox>`,
      { imports: listboxImports, componentProperties: { id } }
    );
    expect(screen.getByRole('option', { name: 'A' }).id).toBe('custom-1');
    await user.tab();
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-activedescendant', 'custom-1');
  });

  it('numbers ids per application, so two applications render identical ids', async () => {
    const template = `
      <volt-listbox aria-label="x">
        <volt-listbox-section>
          <volt-listbox-header>H</volt-listbox-header>
          <volt-listbox-option value="a">A</volt-listbox-option>
        </volt-listbox-section>
      </volt-listbox>`;
    const ids = async () => {
      const { container } = await render(template, { imports: listboxImports });
      const found = [...container.querySelectorAll('[id]')].map(e => e.id);
      TestBed.resetTestingModule();
      return found;
    };
    const first = await ids();
    expect(first).toHaveLength(3);
    expect(await ids()).toEqual(first);
  });

  it('keeps the listbox trigger marker compilable', async () => {
    await render(`<button voltListboxTrigger>Open</button>`, { imports: listboxImports });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

describe('Quartz select', () => {
  const select = (attrs = '') => `
    <volt-select aria-label="Framework" placeholder="Pick one" ${attrs}>
      <volt-select-content>
        <volt-select-item value="angular">Angular</volt-select-item>
        <volt-select-item value="react" disabled>React</volt-select-item>
        <volt-select-item value="svelte">Svelte</volt-select-item>
      </volt-select-content>
    </volt-select>`;

  it('names the popup after the trigger', async () => {
    const user = userEvent.setup();
    await render(select(), { imports: selectImports });
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('listbox')).toHaveAccessibleName('Framework');
  });

  it('shows the placeholder for an empty multiple value', async () => {
    await render(select('multiple [value]="[]"'), { imports: selectImports });
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick one');
  });

  it('moves focus into the popup, supports typeahead and returns focus to the trigger', async () => {
    const changed = vi.fn();
    const user = userEvent.setup();
    await render(select('(valueChange)="changed($event)"'), {
      imports: selectImports,
      componentProperties: { changed },
    });
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Angular' })).toHaveFocus());
    await user.keyboard('s');
    expect(screen.getByRole('option', { name: 'Svelte' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(changed).toHaveBeenCalledWith('svelte');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('returns focus to the trigger on Escape and leaves the overlay layer empty', async () => {
    const user = userEvent.setup();
    await render(select(), { imports: selectImports });
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(document.querySelectorAll('[data-qz-overlay-container] > *')).toHaveLength(0);
  });

  it('does not render the popup, and gives the trigger an application-scoped id, before it opens', async () => {
    const ids = async () => {
      const { container } = await render(select(), { imports: selectImports });
      const found = [...container.querySelectorAll('[id]')].map(e => e.id);
      TestBed.resetTestingModule();
      return found;
    };
    const first = await ids();
    expect(first).toEqual(['volt-select-trigger-1']);
    expect(await ids()).toEqual(first);
  });

  it('does not leak overlay layers or listeners across open/close cycles', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(select(), { imports: selectImports });
    const trigger = screen.getByRole('combobox');
    for (let i = 0; i < 3; i++) {
      await user.click(trigger);
      await screen.findByRole('listbox');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    }
    expect(document.querySelectorAll('[data-qz-overlay-container] > *')).toHaveLength(0);
    await user.click(trigger);
    await screen.findByRole('listbox');
    fixture.destroy();
    expect(document.querySelectorAll('[role="listbox"]')).toHaveLength(0);
    expect(document.querySelectorAll('[data-qz-overlay-container] > *')).toHaveLength(0);
  });

  it('keeps the scalar value shape of single mode and the array shape of multiple mode', async () => {
    const user = userEvent.setup();
    const single = vi.fn();
    await render(select('(valueChange)="single($event)"'), {
      imports: selectImports,
      componentProperties: { single },
    });
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Svelte' }));
    expect(single).toHaveBeenCalledWith('svelte');
    TestBed.resetTestingModule();
    const multi = vi.fn();
    await render(select('multiple (valueChange)="multi($event)"'), {
      imports: selectImports,
      componentProperties: { multi },
    });
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Svelte' }));
    expect(multi).toHaveBeenCalledWith(['svelte']);
  });
});
