import { Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltNativeSelect } from './native-select';

@Component({
  selector: 'app-native-select-test-wrapper',
  imports: [VoltNativeSelect],
  template: `
    <select voltNativeSelect [disabled]="disabled()" aria-label="Fruit">
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
    </select>
  `,
})
class NativeSelectTestWrapper {
  readonly disabled = input(false);
}

describe('VoltNativeSelect', () => {
  it('should render a native select with projected options', async () => {
    await render(NativeSelectTestWrapper);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('should reflect the disabled input on the native element', async () => {
    await render(NativeSelectTestWrapper, {
      componentInputs: { disabled: true },
    });

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-native-select-form-wrapper',
      imports: [ReactiveFormsModule, VoltNativeSelect],
      template: `
        <select voltNativeSelect [formControl]="fruit" aria-label="Fruit">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </select>
      `,
    })
    class NativeSelectFormWrapper {
      fruit = new FormControl('apple', { nonNullable: true });
    }

    const { fixture } = await render(NativeSelectFormWrapper);
    const select = screen.getByRole('combobox') as HTMLSelectElement;

    expect(select.value).toBe('apple');

    await user.selectOptions(select, 'banana');
    expect(fixture.componentInstance.fruit.value).toBe('banana');

    fixture.componentInstance.fruit.setValue('apple');
    fixture.detectChanges();
    expect(select.value).toBe('apple');

    fixture.componentInstance.fruit.disable();
    fixture.detectChanges();
    expect(select).toBeDisabled();
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-native-select-ng-model-wrapper',
      imports: [FormsModule, VoltNativeSelect],
      template: `
        <select voltNativeSelect [(ngModel)]="fruit" aria-label="Fruit">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </select>
      `,
    })
    class NativeSelectNgModelWrapper {
      fruit = 'apple';
    }

    const { fixture } = await render(NativeSelectNgModelWrapper);
    await fixture.whenStable();
    const select = screen.getByRole('combobox') as HTMLSelectElement;

    await user.selectOptions(select, 'banana');
    expect(fixture.componentInstance.fruit).toBe('banana');
  });
});
