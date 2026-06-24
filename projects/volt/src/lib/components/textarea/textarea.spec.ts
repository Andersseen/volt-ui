import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
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
});
