import { Component, model } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltSelect } from './select';
import { VoltSelectContent } from './select-content';
import { VoltSelectItem } from './select-item';

@Component({
  selector: 'app-select-test-wrapper',
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem],
  template: `
    <volt-select [(value)]="value" placeholder="Choose an option">
      <volt-select-content>
        <volt-select-item value="a">Option A</volt-select-item>
        <volt-select-item value="b">Option B</volt-select-item>
      </volt-select-content>
    </volt-select>
  `,
})
class SelectTestWrapper {
  readonly value = model<string | undefined>(undefined);
}

describe('VoltSelect', () => {
  it('should render the select trigger with placeholder', async () => {
    await render(SelectTestWrapper);

    expect(screen.getByRole('combobox')).toHaveTextContent('Choose an option');
  });

  it('should reflect the selected value', async () => {
    await render(SelectTestWrapper, {
      componentInputs: { value: 'b' },
    });

    expect(screen.getByRole('combobox')).toHaveTextContent('b');
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-select-form-wrapper',
      imports: [ReactiveFormsModule, VoltSelect, VoltSelectContent, VoltSelectItem],
      template: `
        <volt-select [formControl]="control" placeholder="Choose an option">
          <volt-select-content>
            <volt-select-item value="a">Option A</volt-select-item>
            <volt-select-item value="b">Option B</volt-select-item>
          </volt-select-content>
        </volt-select>
      `,
    })
    class SelectFormWrapper {
      control = new FormControl<string | undefined>('a', { nonNullable: true });
    }

    const { fixture } = await render(SelectFormWrapper);
    const trigger = screen.getByRole('combobox');

    expect(trigger).toHaveTextContent('a');

    await user.click(trigger);
    await user.click(await screen.findByText('Option B'));
    expect(fixture.componentInstance.control.value).toBe('b');

    fixture.componentInstance.control.setValue('a');
    fixture.detectChanges();
    expect(trigger).toHaveTextContent('a');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(trigger).toBeDisabled();
  });
});
