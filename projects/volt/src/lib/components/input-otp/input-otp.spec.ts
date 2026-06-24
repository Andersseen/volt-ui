import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltInputOtp, VoltInputOtpSlot } from './';

@Component({
  selector: 'app-input-otp-test-wrapper',
  imports: [VoltInputOtp, VoltInputOtpSlot],
  template: `<volt-input-otp [length]="length()" />`,
})
class InputOtpTestWrapper {
  readonly length = input<number>(6);
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
});
