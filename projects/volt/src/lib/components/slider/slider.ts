import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  injectSliderState,
  NgpSlider,
  NgpSliderRange,
  NgpSliderThumb,
  NgpSliderTrack,
  provideSliderState,
} from 'ng-primitives/slider';

import type { NgpOrientation } from 'ng-primitives/common';

@Component({
  selector: 'volt-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideSliderState(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltSlider),
      multi: true,
    },
  ],
  hostDirectives: [
    {
      directive: NgpSlider,
      inputs: [
        'id: id',
        'ngpSliderValue: value',
        'ngpSliderMin: min',
        'ngpSliderMax: max',
        'ngpSliderStep: step',
        'ngpSliderDisabled: disabled',
        'ngpSliderOrientation: orientation',
      ],
      outputs: ['ngpSliderValueChange: valueChange'],
    },
  ],
  host: {
    class: 'relative flex w-full touch-none select-none items-center',
    '(focusout)': 'onTouched()',
  },
  imports: [NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
  template: `
    <div
      ngpSliderTrack
      class="relative h-2 w-full grow overflow-hidden rounded-full bg-muted-foreground/20"
    >
      <div ngpSliderRange class="absolute h-full rounded-full bg-primary"></div>
    </div>
    <div
      ngpSliderThumb
      [attr.aria-label]="ariaLabel()"
      class="absolute top-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[press]:cursor-grabbing"
    ></div>
  `,
})
export class VoltSlider implements ControlValueAccessor {
  /** Access the slider state to wire up forms integration. */
  private readonly state = injectSliderState();

  readonly id = input<string>();
  readonly value = input<number, number>(0, { transform: numberAttribute });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
  readonly step = input<number, number>(1, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<NgpOrientation>('horizontal');
  readonly ariaLabel = input<string>();
  readonly valueChange = output<number>();

  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    this.state().valueChange.subscribe(value => this.onChange(value));
  }

  writeValue(value: number | null | undefined): void {
    if (value != null) {
      this.state().setValue(value);
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}
