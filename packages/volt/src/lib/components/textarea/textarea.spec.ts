import { Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltTextarea } from './textarea';

@Component({
  selector: 'app-textarea-test-wrapper',
  imports: [VoltTextarea],
  template: `<volt-textarea
    [placeholder]="placeholder()"
    [state]="state()"
    [rows]="rows()"
    [disabled]="disabled()"
  />`,
})
class TextareaTestWrapper {
  readonly placeholder = input('Type here...');
  readonly state = input<'default' | 'error'>('default');
  readonly rows = input<number | string>(3);
  readonly disabled = input(false);
}

describe('VoltTextarea', () => {
  it('should render textarea with placeholder', async () => {
    await render(TextareaTestWrapper);

    const textarea = screen.getByPlaceholderText('Type here...');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should apply error state classes and aria-invalid', async () => {
    const { container } = await render(TextareaTestWrapper, {
      componentInputs: { state: 'error' },
    });

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('border-error');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('should be disabled', async () => {
    await render(TextareaTestWrapper, {
      componentInputs: { disabled: true },
    });

    const textarea = screen.getByPlaceholderText('Type here...');
    expect(textarea).toBeDisabled();
  });

  it('should coerce string rows input to a number attribute', async () => {
    const { container } = await render(TextareaTestWrapper, {
      componentInputs: { rows: '5' },
    });

    expect(container.querySelector('textarea')).toHaveAttribute('rows', '5');
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-textarea-form-wrapper',
      imports: [ReactiveFormsModule, VoltTextarea],
      template: `<volt-textarea [formControl]="control" placeholder="Message" />`,
    })
    class TextareaFormWrapper {
      control = new FormControl('initial', { nonNullable: true });
    }

    const { fixture } = await render(TextareaFormWrapper);
    const textarea = screen.getByRole('textbox');

    expect(textarea).toHaveValue('initial');

    fixture.componentInstance.control.setValue('updated');
    fixture.detectChanges();
    expect(textarea).toHaveValue('updated');

    await user.clear(textarea);
    await user.type(textarea, 'typed message');
    expect(fixture.componentInstance.control.value).toBe('typed message');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(textarea).toBeDisabled();

    await user.type(textarea, ' blocked');
    expect(fixture.componentInstance.control.value).toBe('typed message');
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-textarea-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltTextarea],
      template: `<volt-textarea [formControl]="control" placeholder="Message" />`,
    })
    class TextareaInvalidWrapper {
      control = new FormControl('', { nonNullable: true, validators: Validators.required });
    }

    const { fixture } = await render(TextareaInvalidWrapper);
    const textarea = screen.getByRole('textbox');

    expect(textarea).not.toHaveAttribute('aria-invalid');

    await user.click(textarea);
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-textarea-ng-model-wrapper',
      imports: [FormsModule, VoltTextarea],
      template: `<volt-textarea [(ngModel)]="value" placeholder="Message" />`,
    })
    class TextareaNgModelWrapper {
      value = 'initial';
    }

    const { fixture } = await render(TextareaNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const textarea = screen.getByRole('textbox');

    expect(textarea).toHaveValue('initial');

    await user.clear(textarea);
    await user.type(textarea, 'typed');

    expect(fixture.componentInstance.value).toBe('typed');
  });

  describe('1.1 customization', () => {
    it('merges class onto the native textarea and keeps the host clean', async () => {
      const { container } = await render(
        `<volt-textarea class="font-mono px-2" aria-label="Notes" />`,
        { imports: [VoltTextarea] }
      );
      const native = screen.getByRole('textbox', { name: 'Notes' });

      expect(native).toHaveClass('font-mono', 'px-2');
      expect(native).not.toHaveClass('px-4');
      expect(container.querySelector('volt-textarea')).not.toHaveClass('font-mono');
      expect(container.querySelector('volt-textarea')).not.toHaveAttribute('aria-label');
    });

    it('supports the success state alongside error', async () => {
      const { container } = await render(
        `<volt-textarea state="success" /><volt-textarea state="error" />`,
        { imports: [VoltTextarea] }
      );
      const [success, error] = Array.from(container.querySelectorAll('textarea'));

      expect(success).toHaveClass('border-success');
      expect(success).not.toHaveAttribute('aria-invalid');
      expect(error).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not duplicate a consumer id on the host', async () => {
      const { container } = await render(`<volt-textarea id="bio" />`, {
        imports: [VoltTextarea],
      });

      expect(container.querySelectorAll('#bio')).toHaveLength(1);
      expect(container.querySelector('#bio')!.tagName).toBe('TEXTAREA');
    });
  });
});
