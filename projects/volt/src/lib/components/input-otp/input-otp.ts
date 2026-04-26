import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  numberAttribute,
  TemplateRef,
  contentChild,
} from '@angular/core';
import { NgpInputOtp, provideInputOtpState } from 'ng-primitives/input-otp';
import { VoltInputOtpSlot } from './input-otp-slot';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'volt-input-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideInputOtpState()],
  imports: [VoltInputOtpSlot, NgTemplateOutlet],
  host: {
    class: 'flex items-center gap-2',
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
    <input ngpInputOtpInput class="sr-only" />
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
export class VoltInputOtp {
  readonly value = model<string>('');
  readonly length = input<number, number>(6, { transform: numberAttribute });
  readonly pattern = input<string>('[0-9]');
  readonly inputMode = input<'numeric' | 'text' | 'decimal' | 'tel' | 'search' | 'email' | 'url'>(
    'numeric'
  );
  readonly disabled = input<boolean>(false);
  readonly placeholder = input<string>('○');
  readonly slotTemplate = contentChild<TemplateRef<unknown>>('slotTemplate');

  protected readonly slots = () =>
    Array.from({ length: this.length() }, (_, i) => ({
      index: i,
      char: '',
      placeholder: this.placeholder(),
    }));
}
