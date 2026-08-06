import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  injectInputOtpState,
  NgpInputOtp,
  NgpInputOtpInput,
  provideInputOtpState,
} from 'ng-primitives/input-otp';
import { VoltInputOtpSlot } from './input-otp-slot';
import { injectFormControlState } from '../../form-control-state';

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
    class: 'flex items-center gap-2',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(focusout)': 'onTouched()',
  },
  hostDirectives: [
    {
      directive: NgpInputOtp,
      inputs: [
        'ngpInputOtpValue: value',
        'ngpInputOtpPattern: pattern',
        'ngpInputOtpInputMode: inputMode',
        'ngpInputOtpDisabled: disabled',
        'ngpInputOtpPlaceholder: placeholder',
      ],
      outputs: ['ngpInputOtpValueChange: valueChange', 'ngpInputOtpComplete: complete'],
    },
  ],
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
  private readonly state = injectInputOtpState();
  protected readonly formControlState = injectFormControlState();

  readonly value = model<string>('');
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
    // These are declared here for the documented public API and also aliased onto the
    // primitive. A consumer's binding reaches both, but the defaults above only ever
    // applied to this class — the primitive kept its own ('' placeholder, 'text'
    // inputMode), so a default OTP field showed no placeholder and asked mobile
    // keyboards for text instead of digits.
    effect(() => {
      const state = this.state();
      state.placeholder.set(this.placeholder());
      state.inputMode.set(this.inputMode());
      state.pattern.set(this.pattern());
    });

    // Only notify the form here. `valueChange` is already the public alias for the
    // primitive's own output, so echoing into the `value` model would emit the very
    // same change a second time to anyone bound with `[(value)]`.
    this.state().valueChange.subscribe(value => this.onChange(value));
  }

  protected readonly slots = () =>
    Array.from({ length: this.length() }, (_, i) => ({
      index: i,
      placeholder: this.placeholder(),
    }));

  writeValue(value: string | null | undefined): void {
    // Write into the primitive's state, not the `value` model — the model is only the
    // public alias for it, so setting it here left the slots empty under `[formControl]`.
    this.state().value.set(value ?? '');
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
