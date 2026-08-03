import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { VoltListbox, VoltListboxHeader, VoltListboxOption, VoltListboxSection } from './index';

@Component({
  imports: [VoltListbox, VoltListboxHeader, VoltListboxOption, VoltListboxSection],
  template: `
    <volt-listbox aria-label="Framework" [(value)]="value">
      <volt-listbox-header>Frameworks</volt-listbox-header>
      <volt-listbox-section>
        <volt-listbox-option value="angular">Angular</volt-listbox-option>
        <volt-listbox-option value="react" disabled>React</volt-listbox-option>
      </volt-listbox-section>
    </volt-listbox>
  `,
})
class ListboxFixture {
  readonly value = signal<string[]>([]);
}

@Component({
  imports: [ReactiveFormsModule, VoltListbox, VoltListboxOption],
  template: `
    <volt-listbox [formControl]="control" aria-label="Framework form">
      <volt-listbox-option value="angular">Angular</volt-listbox-option>
      <volt-listbox-option value="react">React</volt-listbox-option>
    </volt-listbox>
  `,
})
class ListboxFormsFixture {
  readonly control = new FormControl<string[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
}

describe('listbox components', () => {
  it('expose listbox semantics, selection and disabled state', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ListboxFixture);
    const listbox = screen.getByRole('listbox', { name: 'Framework' });
    const angular = screen.getByRole('option', { name: 'Angular' });
    const react = screen.getByRole('option', { name: 'React' });

    expect(listbox).toBeInTheDocument();
    expect(react).toHaveAttribute('aria-disabled', 'true');
    await user.click(angular);
    expect(fixture.componentInstance.value()).toContain('angular');
    expect(angular).toHaveAttribute('aria-selected', 'true');
    expect(angular).toHaveAttribute('data-selected');
  });

  it('supports Reactive Forms value, touched, invalid and disabled contracts', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ListboxFormsFixture);
    const listbox = screen.getByRole('listbox', { name: 'Framework form' });

    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();
    expect(listbox).toHaveAttribute('aria-invalid', 'true');

    await user.click(screen.getByRole('option', { name: 'Angular' }));
    expect(fixture.componentInstance.control.value).toEqual(['angular']);

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(listbox).toHaveAttribute('data-disabled');
    expect(listbox).toHaveAttribute('tabindex', '-1');
  });

  it('supports active-option keyboard selection', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ListboxFormsFixture);
    const listbox = screen.getByRole('listbox', { name: 'Framework form' });

    listbox.focus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(fixture.componentInstance.control.value).toEqual(['angular']);
  });
});
