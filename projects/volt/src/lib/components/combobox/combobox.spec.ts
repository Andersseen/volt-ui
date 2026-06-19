import { Component, model } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltCombobox } from './combobox';

@Component({
  selector: 'app-combobox-test-wrapper',
  imports: [VoltCombobox],
  template: `
    <volt-combobox [(value)]="value" [items]="frameworks" placeholder="Select framework">
      <ng-template let-item>{{ item }}</ng-template>
    </volt-combobox>
  `,
})
class ComboboxTestWrapper {
  readonly value = model<string | undefined>(undefined);
  readonly frameworks = ['Angular', 'React', 'Vue', 'Svelte'];
}

describe('VoltCombobox', () => {
  it('should render the input with the placeholder', async () => {
    await render(ComboboxTestWrapper);

    expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'Select framework');
  });

  it('should display the selected value in the input', async () => {
    await render(ComboboxTestWrapper, {
      componentInputs: { value: 'Angular' },
    });

    expect(screen.getByRole('combobox')).toHaveValue('Angular');
  });

  it('should open the dropdown and render all options on focus', async () => {
    await render(ComboboxTestWrapper);

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('should filter options when typing', async () => {
    await render(ComboboxTestWrapper);

    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, 'Re');

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('React');
  });

  it('should select an option and update the value', async () => {
    const { fixture } = await render(ComboboxTestWrapper);

    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: 'Vue' }));

    expect(fixture.componentInstance.value()).toBe('Vue');
    expect(input).toHaveValue('Vue');
  });

  it('should clear the input when the value is reset', async () => {
    const { fixture } = await render(ComboboxTestWrapper, {
      componentInputs: { value: 'React' },
    });

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('React');

    fixture.componentInstance.value.set(undefined);
    fixture.detectChanges();

    expect(input).toHaveValue('');
  });
});
