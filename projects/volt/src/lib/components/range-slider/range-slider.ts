import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  injectRangeSliderState,
  NgpRangeSlider,
  NgpRangeSliderRange,
  NgpRangeSliderThumb,
  NgpRangeSliderTrack,
  provideRangeSliderState,
} from 'ng-primitives/slider';
import { merge } from 'rxjs';

import type { NgpOrientation } from 'ng-primitives/common';
import { injectFormControlState } from '../../form-control-state';

@Component({
  selector: 'volt-range-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideRangeSliderState(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltRangeSlider),
      multi: true,
    },
  ],
  hostDirectives: [
    {
      directive: NgpRangeSlider,
      inputs: [
        'ngpRangeSliderLow: low',
        'ngpRangeSliderHigh: high',
        'ngpRangeSliderMin: min',
        'ngpRangeSliderMax: max',
        'ngpRangeSliderStep: step',
        'ngpRangeSliderDisabled: disabled',
        'ngpRangeSliderOrientation: orientation',
      ],
      outputs: ['ngpRangeSliderLowChange: lowChange', 'ngpRangeSliderHighChange: highChange'],
    },
  ],
  host: {
    class: 'relative flex w-full touch-none select-none items-center',
    '(focusout)': 'onTouched()',
  },
  imports: [NgpRangeSliderTrack, NgpRangeSliderRange, NgpRangeSliderThumb],
  template: `
    <div
      ngpRangeSliderTrack
      class="relative h-2 w-full grow overflow-hidden rounded-full bg-muted-foreground/20"
    >
      <div ngpRangeSliderRange class="absolute h-full rounded-full bg-primary"></div>
    </div>
    <div
      ngpRangeSliderThumb
      [attr.aria-label]="ariaLabelLow()"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      class="absolute top-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[press]:cursor-grabbing"
    ></div>
    <div
      ngpRangeSliderThumb
      [attr.aria-label]="ariaLabelHigh()"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      class="absolute top-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[press]:cursor-grabbing"
    ></div>
  `,
})
export class VoltRangeSlider implements ControlValueAccessor {
  /** Access the range slider state to wire up forms integration. */
  private readonly state = injectRangeSliderState();
  protected readonly formControlState = injectFormControlState();

  readonly low = input<number, number>(0, { transform: numberAttribute });
  readonly high = input<number, number>(100, { transform: numberAttribute });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
  readonly step = input<number, number>(1, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<NgpOrientation>('horizontal');
  readonly ariaLabelLow = input<string>();
  readonly ariaLabelHigh = input<string>();
  readonly lowChange = output<number>();
  readonly highChange = output<number>();

  private readonly controlDisabled = signal(false);
  private readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: [number, number]) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      this.state().setDisabled(this.isDisabled());
    });

    merge(this.state().lowChange, this.state().highChange)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onChange([this.state().low(), this.state().high()]));
  }

  writeValue(value: [number, number] | null | undefined): void {
    if (!value || value.length !== 2) {
      return;
    }

    const [low, high] = value;
    this.state().setLowValue(low);
    this.state().setHighValue(high);
  }

  registerOnChange(fn: (value: [number, number]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
    this.state().setDisabled(this.isDisabled());
  }
}
