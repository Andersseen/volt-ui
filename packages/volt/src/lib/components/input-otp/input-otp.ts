import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpInputOtpInput, ngpInputOtp, provideInputOtpState } from 'ng-primitives/input-otp';
import { VoltInputOtpSlot } from './input-otp-slot';
import { injectFormControlState } from '../../form-control-state';
import { cn } from '../../utils';

@Component({
  selector: 'volt-input-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideInputOtpState(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltInputOtp),
      multi: true,
    },
  ],
  // NgpInputOtpInput is what connects the hidden input to the primitive's state.
  // Without it in imports, `ngpInputOtpInput` below is an inert attribute: the input
  // still accepts text but no slot ever fills.
  imports: [NgpInputOtpInput, VoltInputOtpSlot],
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(focusout)': 'onTouched()',
  },
  template: `
    <input
      ngpInputOtpInput
      [disabled]="isDisabled()"
      [attr.aria-label]="ariaLabel()"
      class="sr-only"
    />
    @for (slot of slots(); track $index) {
      <volt-input-otp-slot />
    }
  `,
})
export class VoltInputOtp implements ControlValueAccessor {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('flex items-center gap-2', this.class()));

  protected readonly formControlState = injectFormControlState();

  readonly value = model<string>('');
  readonly complete = output<string>();
  readonly length = input<number, number>(6, { transform: numberAttribute });
  readonly pattern = input<string>('[0-9]');
  readonly inputMode = input<'numeric' | 'text' | 'decimal' | 'tel' | 'search' | 'email' | 'url'>(
    'numeric'
  );
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>('One-time password');
  readonly placeholder = input<string>('○');
  private readonly controlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    // Driven through the primitive's function form rather than the NgpInputOtp host directive:
    // upstream state is read-only and fed by inputs, so a host directive can only receive what
    // a consumer binds — never Volt's own defaults ('○' placeholder, numeric input mode).
    // The primitive follows the `value` model and reports typing back through `onValueChange`,
    // so `[(value)]` emits once per change and the form is notified from the same place.
    ngpInputOtp({
      value: this.value,
      pattern: this.pattern,
      inputMode: this.inputMode,
      disabled: this.isDisabled,
      placeholder: this.placeholder,
      onValueChange: value => {
        this.value.set(value);
        this.onChange(value);
      },
      onComplete: value => this.complete.emit(value),
    });
  }

  protected readonly slots = () =>
    Array.from({ length: this.length() }, (_, i) => ({
      index: i,
      placeholder: this.placeholder(),
    }));

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
