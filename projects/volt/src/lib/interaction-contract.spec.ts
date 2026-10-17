import { signal, type WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltCheckbox,
  VoltInput,
  VoltListbox,
  VoltListboxOption,
  VoltPagination,
  VoltPaginationButton,
  VoltPaginationNext,
  VoltPaginationPrevious,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSwitch,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltTextarea,
  VoltToggle,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from '../public-api';

/**
 * Interaction contracts the per-component specs did not reach (see specs/behavioral-contracts.md):
 * two-way binding, keyboard operation, a static or dynamic value that must stay interactive, one
 * emission per user action and none for a programmatic write — observed through the DOM.
 */
async function set<T>(fixture: ComponentFixture<unknown>, name: string, value: T): Promise<void> {
  (fixture.componentInstance as Record<string, WritableSignal<T>>)[name].set(value);
  await fixture.whenStable();
}

describe('pagination', () => {
  const template = (extra = '') => `
    <volt-pagination [page]="page" [pageCount]="5" ${extra}>
      <volt-pagination-previous />
      <volt-pagination-button [page]="1" />
      <volt-pagination-button [page]="2" />
      <volt-pagination-button [page]="3" />
      <volt-pagination-next />
    </volt-pagination>`;
  const imports = [
    VoltPagination,
    VoltPaginationButton,
    VoltPaginationNext,
    VoltPaginationPrevious,
  ];
  const current = () =>
    screen.getAllByRole('button').find(b => b.getAttribute('aria-current') === 'page');

  it('a static page stays interactive: clicking Next moves to the following page, emitting once', async () => {
    const pageChange = vi.fn();
    await render(template('(pageChange)="pageChange($event)"'), {
      imports,
      componentProperties: { page: 1, pageChange },
    });
    expect(current()).toHaveTextContent('1');
    await userEvent.setup().click(screen.getByRole('button', { name: /next/i }));
    expect(current()).toHaveTextContent('2');
    expect(pageChange).toHaveBeenCalledTimes(1);
    expect(pageChange).toHaveBeenCalledWith(2);
  });

  it('a dynamic page reaches the DOM and the control stays usable afterwards', async () => {
    const { fixture } = await render(template().replace('[page]="page"', '[page]="page()"'), {
      imports,
      componentProperties: { page: signal(1) },
    });
    await set(fixture, 'page', 3);
    expect(current()).toHaveTextContent('3');
    await userEvent.setup().click(screen.getByRole('button', { name: '1' }));
    expect(current()).toHaveTextContent('1');
  });

  it('a numbered button is operable from the keyboard and exposes aria-current', async () => {
    await render(template(), { imports, componentProperties: { page: 1 } });
    const user = userEvent.setup();
    screen.getByRole('button', { name: '3' }).focus();
    await user.keyboard('{Enter}');
    expect(current()).toHaveTextContent('3');
  });

  it('Previous is disabled on the first page and Next on the last', async () => {
    await render(
      `<volt-pagination [page]="1" [pageCount]="1">
         <volt-pagination-previous /><volt-pagination-button [page]="1" /><volt-pagination-next />
       </volt-pagination>`,
      { imports }
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});

describe('input and textarea two-way binding and forms', () => {
  it.each([
    ['input', '<volt-input aria-label="Name" [(value)]="value" />', VoltInput],
    ['textarea', '<volt-textarea aria-label="Name" [(value)]="value" />', VoltTextarea],
  ] as const)(
    '%s: [(value)] shows the parent value and reports what is typed',
    async (_n, tpl, cmp) => {
      const { fixture } = await render(tpl, {
        imports: [cmp],
        componentProperties: { value: signal('Ada') },
      });
      const field = screen.getByRole('textbox', { name: 'Name' });
      expect(field).toHaveValue('Ada');
      await userEvent.setup().type(field, ' L');
      expect((fixture.componentInstance as { value: WritableSignal<string> }).value()).toBe(
        'Ada L'
      );
      await set(fixture, 'value', 'Grace');
      expect(field).toHaveValue('Grace');
    }
  );

  it.each([
    ['input', '<volt-input aria-label="Name" [formControl]="c" />', VoltInput],
    ['textarea', '<volt-textarea aria-label="Name" [formControl]="c" />', VoltTextarea],
  ] as const)('%s: an invalid, touched control is announced as invalid', async (_n, tpl, cmp) => {
    const c = new FormControl('', { validators: [Validators.required] });
    await render(tpl, { imports: [cmp, ReactiveFormsModule], componentProperties: { c } });
    const field = screen.getByRole('textbox', { name: 'Name' });
    expect(field).not.toHaveAttribute('aria-invalid', 'true');
    c.markAsTouched();
    c.updateValueAndValidity();
    await userEvent.setup().click(field);
    await userEvent.setup().tab();
    expect(field).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('checkbox, switch, toggle', () => {
  it.each([
    ['checkbox', '<volt-checkbox aria-label="X" [(checked)]="on" />', VoltCheckbox, 'checkbox'],
    ['switch', '<volt-switch aria-label="X" [(checked)]="on" />', VoltSwitch, 'switch'],
  ] as const)(
    '%s: [(checked)] reflects the parent and reports a click and the keyboard',
    async (_n, tpl, cmp, role) => {
      const { fixture } = await render(tpl, {
        imports: [cmp],
        componentProperties: { on: signal(false) },
      });
      const host = fixture.componentInstance as { on: WritableSignal<boolean> };
      const control = screen.getByRole(role);
      const user = userEvent.setup();

      await user.click(control);
      expect(host.on()).toBe(true);
      control.focus();
      await user.keyboard(' ');
      expect(host.on()).toBe(false);
      // Enter does not toggle a checkbox (it submits a form); Space does.

      await set(fixture, 'on', false);
      expect(control).not.toBeChecked();
    }
  );

  it('toggle: [(pressed)] reflects the parent and reports a click and the keyboard', async () => {
    const { fixture } = await render(
      '<volt-toggle aria-label="B" [(pressed)]="on">B</volt-toggle>',
      {
        imports: [VoltToggle],
        componentProperties: { on: signal(false) },
      }
    );
    const host = fixture.componentInstance as { on: WritableSignal<boolean> };
    const button = screen.getByRole('button');
    const user = userEvent.setup();
    await user.click(button);
    expect(host.on()).toBe(true);
    button.focus();
    await user.keyboard(' ');
    expect(host.on()).toBe(false);
    await set(fixture, 'on', true);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('radio, toggle-group, listbox two-way binding', () => {
  it('radio: [(value)] follows the parent and reports a click', async () => {
    const { fixture } = await render(
      `<volt-radio-group [(value)]="v"><volt-radio-item value="a">A</volt-radio-item><volt-radio-item value="b">B</volt-radio-item></volt-radio-group>`,
      {
        imports: [VoltRadioGroup, VoltRadioItem],
        componentProperties: { v: signal<string | null>('a') },
      }
    );
    const host = fixture.componentInstance as { v: WritableSignal<string | null> };
    await userEvent.setup().click(screen.getByRole('radio', { name: 'B' }));
    expect(host.v()).toBe('b');
    await set(fixture, 'v', 'a');
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
  });

  it('toggle-group: [(value)] follows the parent and reports a click', async () => {
    const { fixture } = await render(
      `<volt-toggle-group [(value)]="v"><volt-toggle-group-item value="a">A</volt-toggle-group-item><volt-toggle-group-item value="b">B</volt-toggle-group-item></volt-toggle-group>`,
      { imports: [VoltToggleGroup, VoltToggleGroupItem], componentProperties: { v: signal(['a']) } }
    );
    const host = fixture.componentInstance as { v: WritableSignal<string[]> };
    await userEvent.setup().click(screen.getByRole('radio', { name: 'B' }));
    expect(host.v()).toEqual(['b']);
    await set(fixture, 'v', ['a']);
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
  });

  it('listbox: [(value)] follows the parent; options are named, clickable and expose selection', async () => {
    const { fixture } = await render(
      `<volt-listbox aria-label="Fruit" [(value)]="v"><volt-listbox-option value="a">Apple</volt-listbox-option><volt-listbox-option value="b">Banana</volt-listbox-option></volt-listbox>`,
      { imports: [VoltListbox, VoltListboxOption], componentProperties: { v: signal(['a']) } }
    );
    const host = fixture.componentInstance as { v: WritableSignal<string[]> };
    expect(screen.getByRole('listbox', { name: 'Fruit' })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('option', { name: 'Banana' }));
    expect(host.v()).toEqual(['b']);
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    await set(fixture, 'v', ['a']);
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
  });

  it('listbox: works in a template-driven form', async () => {
    const { fixture } = await render(
      `<volt-listbox aria-label="Fruit" [(ngModel)]="v"><volt-listbox-option value="a">Apple</volt-listbox-option><volt-listbox-option value="b">Banana</volt-listbox-option></volt-listbox>`,
      { imports: [VoltListbox, VoltListboxOption, FormsModule], componentProperties: { v: ['a'] } }
    );
    await fixture.whenStable();
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.setup().click(screen.getByRole('option', { name: 'Banana' }));
    expect((fixture.componentInstance as { v: string[] }).v).toEqual(['b']);
  });
});

describe('accordion and tabs', () => {
  const accordion = `<volt-accordion [disabled]="disabled" (valueChange)="spy($event)">
    <volt-accordion-item value="a"><volt-accordion-trigger>A</volt-accordion-trigger><volt-accordion-content>CA</volt-accordion-content></volt-accordion-item>
    <volt-accordion-item value="b"><volt-accordion-trigger>B</volt-accordion-trigger><volt-accordion-content>CB</volt-accordion-content></volt-accordion-item>
  </volt-accordion>`;
  const accordionImports = [
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
  ];

  it('accordion: opening reports once and shows the content', async () => {
    const spy = vi.fn();
    await render(accordion, {
      imports: accordionImports,
      componentProperties: { spy, disabled: false },
    });
    const user = userEvent.setup();
    expect(screen.queryByText('CA')).not.toBeVisible();
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(screen.getByText('CA')).toBeVisible();
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-expanded', 'true');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('accordion: disabled ignores clicks and the keyboard', async () => {
    const spy = vi.fn();
    await render(accordion, {
      imports: accordionImports,
      componentProperties: { spy, disabled: true },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'A' }));
    screen.getByRole('button', { name: 'B' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-expanded', 'false');
    expect(spy).not.toHaveBeenCalled();
  });

  it('accordion: a programmatic value is not a user change', async () => {
    const spy = vi.fn();
    const { fixture } = await render(
      accordion.replace('(valueChange)', '[value]="v()" (valueChange)'),
      {
        imports: accordionImports,
        componentProperties: { spy, disabled: false, v: signal<string | null>(null) },
      }
    );
    await set(fixture, 'v', 'a');
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-expanded', 'true');
    expect(spy).not.toHaveBeenCalled();
  });

  it('tabs: a programmatic value is not a user change, and a click still selects afterwards', async () => {
    const spy = vi.fn();
    const { fixture } = await render(
      `<volt-tabs [value]="v()" (valueChange)="spy($event)">
         <volt-tabs-list>
           <volt-tabs-trigger value="a">A</volt-tabs-trigger>
           <volt-tabs-trigger value="b">B</volt-tabs-trigger>
           <volt-tabs-trigger value="c">C</volt-tabs-trigger>
         </volt-tabs-list>
         <volt-tabs-content value="a">PA</volt-tabs-content>
         <volt-tabs-content value="b">PB</volt-tabs-content>
         <volt-tabs-content value="c">PC</volt-tabs-content>
       </volt-tabs>`,
      {
        imports: [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent],
        componentProperties: { spy, v: signal('a') },
      }
    );
    const user = userEvent.setup();
    spy.mockClear();
    await set(fixture, 'v', 'c');
    expect(screen.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-selected', 'true');
    expect(spy).not.toHaveBeenCalled();

    await user.click(screen.getByRole('tab', { name: 'A' }));
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('a');
  });
});
