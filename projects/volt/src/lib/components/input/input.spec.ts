import { Component, input, model } from '@angular/core';
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
});
