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
      [ariaLabel]="ariaLabel()"
      [disabled]="disabled()"
      [(value)]="value"
    />
  `,
})
class InputTestWrapper {
  readonly id = input('email');
  readonly type = input('text');
  readonly placeholder = input('Enter value');
  readonly ariaLabel = input('');
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

  it('forwards an accessible label to the native input', async () => {
    await render(InputTestWrapper, { componentInputs: { ariaLabel: 'Email address' } });

    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument();
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

  describe('1.1 customization', () => {
    it('keeps the default appearance when size, state and class are not set', async () => {
      const { container } = await render(`<volt-input />`, { imports: [VoltInput] });
      const native = container.querySelector('input')!;

      expect(native).toHaveClass('h-10', 'px-3', 'py-2', 'text-sm', 'border-input', 'rounded-lg');
      expect(native).toHaveAttribute('data-size', 'md');
    });

    it('applies sm and lg sizes', async () => {
      const { container } = await render(`<volt-input size="sm" /><volt-input size="lg" />`, {
        imports: [VoltInput],
      });
      const [sm, lg] = Array.from(container.querySelectorAll('input'));

      expect(sm).toHaveClass('h-8', 'px-2.5');
      expect(sm).not.toHaveClass('h-10');
      expect(lg).toHaveClass('h-11', 'text-base');
    });

    it('marks state="error" as invalid and styles success', async () => {
      const { container } = await render(
        `<volt-input state="error" aria-label="Bad" /><volt-input state="success" aria-label="Good" />`,
        { imports: [VoltInput] }
      );
      const [error, success] = Array.from(container.querySelectorAll('input'));

      expect(error).toHaveAttribute('aria-invalid', 'true');
      expect(error).toHaveClass('border-error');
      expect(success).not.toHaveAttribute('aria-invalid');
      expect(success).toHaveClass('border-success');
    });

    it('composes an explicit state with a touched invalid form control', async () => {
      @Component({
        imports: [ReactiveFormsModule, VoltInput],
        template: `<volt-input [formControl]="control" state="success" aria-label="Email" />`,
      })
      class ComposedState {
        control = new FormControl('', { nonNullable: true, validators: Validators.required });
      }

      const { fixture } = await render(ComposedState);
      const native = screen.getByRole('textbox', { name: 'Email' });
      expect(native).not.toHaveAttribute('aria-invalid');

      fixture.componentInstance.control.markAsTouched();
      fixture.detectChanges();

      // aria-invalid drives the error border through `aria-invalid:border-error`.
      expect(native).toHaveAttribute('aria-invalid', 'true');
      expect(native).toHaveClass('aria-invalid:border-error');
    });

    it('applies a bound class to the native input and updates it', async () => {
      @Component({
        imports: [VoltInput],
        template: `<volt-input [class]="cls" aria-label="Qty" />`,
      })
      class BoundClass {
        cls = 'w-24';
      }

      const { fixture } = await render(BoundClass);
      const native = screen.getByRole('textbox', { name: 'Qty' });
      expect(native).toHaveClass('w-24');

      fixture.componentInstance.cls = 'w-32 font-mono';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(native).toHaveClass('w-32', 'font-mono');
      expect(native).not.toHaveClass('w-24');
    });

    it('moves aria-label and id to the native input so ids are unique', async () => {
      const { container } = await render(
        `<label for="qty">Quantity</label><volt-input id="qty" /><volt-input aria-label="Search" />`,
        { imports: [VoltInput] }
      );

      expect(container.querySelectorAll('#qty')).toHaveLength(1);
      expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveAttribute('id', 'qty');
      expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
      for (const host of Array.from(container.querySelectorAll('volt-input'))) {
        expect(host).not.toHaveAttribute('id');
        expect(host).not.toHaveAttribute('aria-label');
      }
    });

    it('generates an id when none is given, never an empty one', async () => {
      const { container } = await render(`<volt-input /><volt-input />`, { imports: [VoltInput] });
      const [a, b] = Array.from(container.querySelectorAll('input'));

      expect(a.id).toMatch(/^volt-input-/);
      expect(b.id).toMatch(/^volt-input-/);
      expect(a.id).not.toBe(b.id);
    });
  });
});
