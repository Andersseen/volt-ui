import { Component, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
    <volt-select [(value)]="value" ariaLabel="Example choice" placeholder="Choose an option">
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

@Component({
  selector: 'app-select-multiple-test-wrapper',
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem],
  template: `
    <volt-select
      [(value)]="value"
      [multiple]="true"
      [displayWith]="displayWith"
      ariaLabel="Frameworks"
    >
      <volt-select-content>
        <volt-select-item value="angular">Angular</volt-select-item>
        <volt-select-item value="vue">Vue</volt-select-item>
      </volt-select-content>
    </volt-select>
  `,
})
class SelectMultipleTestWrapper {
  readonly value = model<string[]>(['angular', 'vue']);
  readonly displayWith = (value: unknown) => String(value).toUpperCase();
}

describe('VoltSelect', () => {
  it('should render the select trigger with placeholder', async () => {
    await render(SelectTestWrapper);

    expect(screen.getByRole('combobox', { name: 'Example choice' })).toHaveTextContent(
      'Choose an option'
    );
  });

  it('should reflect the selected value', async () => {
    await render(SelectTestWrapper, {
      componentInputs: { value: 'b' },
    });

    expect(screen.getByRole('combobox')).toHaveTextContent('b');
  });

  it('should render multiple selected values with displayWith labels', async () => {
    await render(SelectMultipleTestWrapper);

    expect(screen.getByRole('combobox', { name: 'Frameworks' })).toHaveTextContent('ANGULAR, VUE');
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

    await user.click(trigger);
    expect(fixture.componentInstance.control.value).toBe('a');
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-select-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltSelect, VoltSelectContent, VoltSelectItem],
      template: `
        <volt-select [formControl]="control" placeholder="Choose an option">
          <volt-select-content>
            <volt-select-item value="a">Option A</volt-select-item>
          </volt-select-content>
        </volt-select>
      `,
    })
    class SelectInvalidWrapper {
      control = new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: Validators.required,
      });
    }

    const { fixture } = await render(SelectInvalidWrapper);
    const trigger = screen.getByRole('combobox');

    expect(trigger).not.toHaveAttribute('aria-invalid');

    await user.tab();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-select-ng-model-wrapper',
      imports: [FormsModule, VoltSelect, VoltSelectContent, VoltSelectItem],
      template: `
        <volt-select [(ngModel)]="value" placeholder="Choose an option">
          <volt-select-content>
            <volt-select-item value="a">Option A</volt-select-item>
            <volt-select-item value="b">Option B</volt-select-item>
          </volt-select-content>
        </volt-select>
      `,
    })
    class SelectNgModelWrapper {
      value = 'a';
    }

    const { fixture } = await render(SelectNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const trigger = screen.getByRole('combobox');

    expect(trigger).toHaveTextContent('a');

    await user.click(trigger);
    await user.click(await screen.findByText('Option B'));

    expect(fixture.componentInstance.value).toBe('b');
  });
});
