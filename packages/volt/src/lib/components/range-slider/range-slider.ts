import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  untracked,
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

import type { NgpOrientation } from 'ng-primitives/common';
import { injectFormControlState } from '../../form-control-state';
import { cn } from '../../utils';

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
        'ngpRangeSliderMin: min',
        'ngpRangeSliderMax: max',
        'ngpRangeSliderStep: step',
        'ngpRangeSliderDisabled: disabled',
        'ngpRangeSliderOrientation: orientation',
      ],
    },
  ],
  host: {
    '[class]': 'classes()',
    '(focusout)': 'onTouched()',
  },
  imports: [NgpRangeSliderTrack, NgpRangeSliderRange, NgpRangeSliderThumb],
  template: `
    <div
      ngpRangeSliderTrack
      class="relative grow overflow-hidden rounded-pill border-(length:--volt-track-border-width) border-border bg-track data-[orientation=horizontal]:h-track data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-track"
    >
      <div
        ngpRangeSliderRange
        class="absolute rounded-pill bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
      ></div>
    </div>
    <div
      ngpRangeSliderThumb
      [attr.aria-label]="ariaLabelLow()"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      class="absolute block size-thumb -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-pill border-2 border-primary bg-background shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring focus-visible:ring-offset-(length:--ring-offset-width) aria-invalid:border-error data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[orientation=horizontal]:top-1/2 data-[orientation=vertical]:left-1/2 data-[press]:cursor-grabbing"
    ></div>
    <div
      ngpRangeSliderThumb
      [attr.aria-label]="ariaLabelHigh()"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      class="absolute block size-thumb -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-pill border-2 border-primary bg-background shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring focus-visible:ring-offset-(length:--ring-offset-width) aria-invalid:border-error data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[orientation=horizontal]:top-1/2 data-[orientation=vertical]:left-1/2 data-[press]:cursor-grabbing"
    ></div>
  `,
})
export class VoltRangeSlider implements ControlValueAccessor {
  readonly class = input<string>('');

  // On the host, not as `data-[orientation=…]:` variants: a consumer's `h-72` has to replace the
  // default through `cn()`, and a variant would outrank it.
  protected readonly classes = computed(() =>
    cn(
      'relative flex touch-none select-none items-center',
      this.orientation() === 'vertical' ? 'h-48 min-w-thumb flex-col' : 'min-h-thumb w-full',
      this.class()
    )
  );

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

  private writtenByForm = false;
  private onChange: (value: [number, number]) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      this.state().setDisabled(this.isDisabled());
    });

    // Volt owns `low`/`high` and writes them into the primitive without emitting, never binding
    // the primitive's own inputs: ng-primitives latches into controlled mode the first time
    // they are defined, which froze a static `[low]="20"` after the first keystroke. The
    // template's defaults must not overwrite what a form control wrote first.
    let first = true;
    effect(() => {
      const low = this.low();
      const high = this.high();
      untracked(() => {
        if (!(first && this.writtenByForm)) {
          this.writeRange(low, high);
        }
        first = false;
      });
    });

    this.state()
      .lowChange.pipe(takeUntilDestroyed())
      .subscribe(low => {
        this.lowChange.emit(low);
        this.onChange([low, this.state().high()]);
      });
    this.state()
      .highChange.pipe(takeUntilDestroyed())
      .subscribe(high => {
        this.highChange.emit(high);
        this.onChange([this.state().low(), high]);
      });
  }

  /** The primitive clamps `low` to `high` and the reverse, so the order depends on the direction. */
  private writeRange(low: number, high: number): void {
    const state = this.state();
    if (low > state.high()) {
      state.setHighValue(high, { emit: false });
      state.setLowValue(low, { emit: false });
    } else {
      state.setLowValue(low, { emit: false });
      state.setHighValue(high, { emit: false });
    }
  }

  /** `null` returns both thumbs to the `low` and `high` inputs, as Slider does with `value`. */
  writeValue(value: [number, number] | null | undefined): void {
    if (value == null) {
      this.writtenByForm = false;
      this.writeRange(this.low(), this.high());
      return;
    }

    if (value.length !== 2) {
      return;
    }

    this.writtenByForm = true;
    this.writeRange(value[0], value[1]);
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
