import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/angular';
import { VoltInputOtp, VoltInputOtpSlot } from './';

@Component({
  selector: 'app-input-otp-test-wrapper',
  imports: [VoltInputOtp, VoltInputOtpSlot],
  template: `<volt-input-otp [length]="length()" />`,
})
class InputOtpTestWrapper {
  readonly length = input<number>(6);
}

@Component({
  imports: [ReactiveFormsModule, VoltInputOtp],
  template: `<volt-input-otp [formControl]="control" [length]="4" />`,
})
class InputOtpFormsWrapper {
  readonly control = new FormControl('1234', { nonNullable: true });
}

describe('VoltInputOtp', () => {
  it('should render the hidden input and slots', async () => {
    const { container } = await render(InputOtpTestWrapper);

    const hiddenInput = container.querySelector('input[ngpInputOtpInput]');
    expect(hiddenInput).toBeInTheDocument();

    const slots = container.querySelectorAll('volt-input-otp-slot');
    expect(slots.length).toBe(6);
  });

  it('should render a custom number of slots', async () => {
    const { container } = await render(InputOtpTestWrapper, {
      componentInputs: { length: 4 },
    });

    const slots = container.querySelectorAll('volt-input-otp-slot');
    expect(slots.length).toBe(4);
  });

  it('supports Reactive Forms values and disabled state', async () => {
    const { fixture, container } = await render(InputOtpFormsWrapper);
    const input = container.querySelector('input');

    expect(fixture.componentInstance.control.value).toBe('1234');
    fixture.componentInstance.control.setValue('9876');
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('9876');

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(input).toBeDisabled();
  });

  it('supports typing, paste and backspace through the hidden input', async () => {
    const { container } = await render(InputOtpTestWrapper, {
      componentInputs: { length: 4 },
    });
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.input(input, { target: { value: '12' } });
    expect(input.value).toBe('12');

    fireEvent.paste(input, {
      clipboardData: { getData: () => '3456' },
    });
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(input).toBeInTheDocument();
  });
});
