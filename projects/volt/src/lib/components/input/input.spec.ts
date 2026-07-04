import { Component, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltInput } from './input';

@Component({
  selector: 'app-input-test-wrapper',
  imports: [VoltInput],
  template: `
    <volt-input
      [id]="id()"
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [(value)]="value"
    />
  `,
})
class InputTestWrapper {
  readonly id = input('email');
  readonly type = input('text');
  readonly placeholder = input('Enter value');
  readonly disabled = input(false);
  readonly value = model('');
}

describe('VoltInput', () => {
  it('should render an input with the provided placeholder', async () => {
    await render(InputTestWrapper);

    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should reflect the value input', async () => {
    await render(InputTestWrapper, {
      componentInputs: { value: 'hello' },
    });

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('hello');
  });

  it('should update value on user input', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(InputTestWrapper);

    const input = screen.getByRole('textbox');
    await user.type(input, 'world');

    expect(input).toHaveValue('world');
    expect(fixture.componentInstance.value()).toBe('world');
  });

  it('should be disabled', async () => {
    await render(InputTestWrapper, {
      componentInputs: { disabled: true },
    });

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-input-form-wrapper',
      imports: [ReactiveFormsModule, VoltInput],
      template: `<volt-input [formControl]="control" placeholder="Email" />`,
    })
    class InputFormWrapper {
      control = new FormControl('hello', { nonNullable: true });
    }

    const { fixture } = await render(InputFormWrapper);
    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('hello');

    fixture.componentInstance.control.setValue('updated');
    fixture.detectChanges();
    expect(input).toHaveValue('updated');

    await user.clear(input);
    await user.type(input, 'typed');
    expect(fixture.componentInstance.control.value).toBe('typed');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input).toBeDisabled();

    await user.type(input, 'blocked');
    expect(fixture.componentInstance.control.value).toBe('typed');
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-input-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltInput],
      template: `<volt-input [formControl]="control" placeholder="Email" />`,
    })
    class InputInvalidWrapper {
      control = new FormControl('', { nonNullable: true, validators: Validators.required });
    }

    const { fixture } = await render(InputInvalidWrapper);
    const input = screen.getByRole('textbox');

    expect(input).not.toHaveAttribute('aria-invalid');

    await user.click(input);
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-input-ng-model-wrapper',
      imports: [FormsModule, VoltInput],
      template: `<volt-input [(ngModel)]="value" placeholder="Name" />`,
    })
    class InputNgModelWrapper {
      value = 'initial';
    }

    const { fixture } = await render(InputNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('initial');

    await user.clear(input);
    await user.type(input, 'typed');

    expect(fixture.componentInstance.value).toBe('typed');
  });
});
