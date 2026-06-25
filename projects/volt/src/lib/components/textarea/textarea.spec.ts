import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
    [disabled]="disabled()"
  />`,
})
class TextareaTestWrapper {
  readonly placeholder = input('Type here...');
  readonly state = input<'default' | 'error'>('default');
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
  });
});
