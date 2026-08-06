import { Component, input, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/angular';
import { NgpInputOtp } from 'ng-primitives/input-otp';
import { VoltInputOtp, VoltInputOtpSlot } from './';

@Component({
  selector: 'app-input-otp-test-wrapper',
  imports: [VoltInputOtp, VoltInputOtpSlot],
  template: `<volt-input-otp [length]="length()" [disabled]="disabled()" />`,
})
class InputOtpTestWrapper {
  readonly length = input<number>(6);
  readonly disabled = input(false);
}

@Component({
  imports: [ReactiveFormsModule, VoltInputOtp],
  template: `<volt-input-otp [formControl]="control" [length]="4" />`,
})
class InputOtpFormsWrapper {
  readonly control = new FormControl('1234', { nonNullable: true });
}

@Component({
  imports: [VoltInputOtp],
  template: `
    <volt-input-otp
      [(value)]="code"
      [length]="4"
      (valueChange)="valueChange($event)"
      (complete)="complete($event)"
    />
  `,
})
class InputOtpTwoWayWrapper {
  readonly code = signal('');
  valueChange = vi.fn();
  complete = vi.fn();
}

/** Each slot renders its own character and marks its own state via data attributes. */
function slots(container: Element): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('volt-input-otp-slot')];
}

function slotChars(container: Element): string[] {
  return slots(container).map(slot => slot.textContent?.trim() ?? '');
}

function activeSlotIndex(container: Element): number {
  return slots(container).findIndex(slot => slot.hasAttribute('data-active'));
}

describe('VoltInputOtp', () => {
  it('should render the hidden input and slots', async () => {
    const { container } = await render(InputOtpTestWrapper);

    const hiddenInput = container.querySelector('input[ngpInputOtpInput]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAccessibleName('One-time password');
    expect(slots(container).length).toBe(6);
  });

  it('should render a custom number of slots', async () => {
    const { container } = await render(InputOtpTestWrapper, {
      componentInputs: { length: 4 },
    });

    expect(slots(container).length).toBe(4);
  });

  it('applies the documented placeholder and numeric input mode by default', async () => {
    const { container } = await render(InputOtpTestWrapper, {
      componentInputs: { length: 4 },
    });

    // Both defaults live on this component but drive the primitive's state; an empty
    // field has to show the placeholder glyph and ask for a digits keyboard.
    expect(slotChars(container)).toEqual(['○', '○', '○', '○']);
    expect(container.querySelector('input')).toHaveAttribute('inputmode', 'numeric');
  });

  it('renders a Reactive Forms value across the slots', async () => {
    const { fixture, container } = await render(InputOtpFormsWrapper);

    expect(slotChars(container)).toEqual(['1', '2', '3', '4']);

    fixture.componentInstance.control.setValue('9876');
    await fixture.whenStable();
    expect(slotChars(container)).toEqual(['9', '8', '7', '6']);
  });

  it('writes typed characters back to the Reactive Forms control', async () => {
    const { fixture, container } = await render(InputOtpFormsWrapper);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.input(input, { target: { value: '55' } });
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toBe('55');
    expect(slotChars(container)).toEqual(['5', '5', '○', '○']);
  });

  it('disables the hidden input through the Reactive Forms control', async () => {
    const { fixture, container } = await render(InputOtpFormsWrapper);

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(container.querySelector('input')).toBeDisabled();
  });

  it('should forward the disabled input to the NgpInputOtp primitive state directly (not just Reactive Forms)', async () => {
    const { fixture } = await render(InputOtpTestWrapper, {
      componentInputs: { disabled: true, length: 4 },
    });

    // NgpInputOtp is applied via hostDirectives on VoltInputOtp's own host element,
    // so it shares the same injector — read its state directly rather than relying on
    // a downstream DOM effect (the hidden input's own separate [disabled] binding
    // would mask this: it's already correctly disabled regardless of this bug).
    const otpDebugEl = fixture.debugElement.query(By.directive(VoltInputOtp));
    const primitive = otpDebugEl.injector.get(NgpInputOtp);
    expect(primitive.state.disabled()).toBe(true);
  });

  it('advances the active slot as characters are typed and retreats on delete', async () => {
    const { fixture, container } = await render(InputOtpTwoWayWrapper);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.focus(input);
    await fixture.whenStable();
    expect(activeSlotIndex(container)).toBe(0);

    fireEvent.input(input, { target: { value: '1' } });
    await fixture.whenStable();
    expect(slots(container)[0]).toHaveAttribute('data-filled');
    expect(activeSlotIndex(container)).toBe(1);

    fireEvent.input(input, { target: { value: '12' } });
    await fixture.whenStable();
    expect(activeSlotIndex(container)).toBe(2);
    expect(slotChars(container)).toEqual(['1', '2', '○', '○']);

    // Deleting a character walks the active slot back with it.
    fireEvent.input(input, { target: { value: '1' } });
    await fixture.whenStable();
    expect(activeSlotIndex(container)).toBe(1);
    expect(slots(container)[1]).not.toHaveAttribute('data-filled');
  });

  it('fills every slot from a paste and reports completion once', async () => {
    const { fixture, container } = await render(InputOtpTwoWayWrapper);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.paste(input, { clipboardData: { getData: () => '4321' } });
    await fixture.whenStable();

    expect(slotChars(container)).toEqual(['4', '3', '2', '1']);
    expect(fixture.componentInstance.code()).toBe('4321');
    expect(fixture.componentInstance.complete).toHaveBeenCalledWith('4321');
    expect(fixture.componentInstance.complete).toHaveBeenCalledTimes(1);
  });

  it('emits valueChange exactly once per change', async () => {
    const { fixture, container } = await render(InputOtpTwoWayWrapper);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.input(input, { target: { value: '12' } });
    await fixture.whenStable();

    // `valueChange` is the primitive's output surfaced under the component's name;
    // mirroring it into the `value` model as well would double every emission.
    expect(fixture.componentInstance.valueChange).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.valueChange).toHaveBeenCalledWith('12');
  });

  it('rejects characters that do not match the pattern', async () => {
    const { fixture, container } = await render(InputOtpTwoWayWrapper);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.input(input, { target: { value: '1a2' } });
    await fixture.whenStable();

    expect(fixture.componentInstance.code()).toBe('12');
    expect(slotChars(container)).toEqual(['1', '2', '○', '○']);
  });
});
