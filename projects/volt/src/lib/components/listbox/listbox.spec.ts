import { Component, signal } from '@angular/core';
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
  });
});
