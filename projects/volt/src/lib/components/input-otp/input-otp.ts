import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  signal,
  TemplateRef,
  contentChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectInputOtpState, NgpInputOtp, provideInputOtpState } from 'ng-primitives/input-otp';
import { VoltInputOtpSlot } from './input-otp-slot';
import { NgTemplateOutlet } from '@angular/common';
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
  imports: [VoltInputOtpSlot, NgTemplateOutlet],
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
        'ngpInputOtpDisabled: isDisabled',
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
      <volt-input-otp-slot>
        <ng-container
          *ngTemplateOutlet="slotTemplate() || defaultSlot; context: { $implicit: slot }"
        />
      </volt-input-otp-slot>
    }

    <ng-template #defaultSlot let-slot>
      <span>{{ slot.char || slot.placeholder }}</span>
    </ng-template>
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
  readonly slotTemplate = contentChild<TemplateRef<unknown>>('slotTemplate');
  private readonly controlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    this.state().valueChange.subscribe(value => {
      this.value.set(value);
      this.onChange(value);
    });
  }

  protected readonly slots = () =>
    Array.from({ length: this.length() }, (_, i) => ({
      index: i,
      char: '',
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
