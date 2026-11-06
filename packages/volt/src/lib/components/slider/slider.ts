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
import { injectFormControlState } from '../../form-control-state';
import { cn } from '../../utils';

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
        'ngpSliderMin: min',
        'ngpSliderMax: max',
        'ngpSliderStep: step',
        'ngpSliderDisabled: disabled',
        'ngpSliderOrientation: orientation',
      ],
    },
  ],
  host: {
    '[class]': 'classes()',
    '(focusout)': 'onTouched()',
  },
  imports: [NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
  template: `
    <div
      ngpSliderTrack
      class="relative grow overflow-hidden rounded-pill border-(length:--volt-track-border-width) border-border bg-track data-[orientation=horizontal]:h-track data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-track"
    >
      <div
        ngpSliderRange
        class="absolute rounded-pill bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
      ></div>
    </div>
    <div
      ngpSliderThumb
      [attr.aria-label]="ariaLabel()"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      class="absolute block size-thumb -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-pill border-2 border-primary bg-background shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring focus-visible:ring-offset-(length:--ring-offset-width) aria-invalid:border-error data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[orientation=horizontal]:top-1/2 data-[orientation=vertical]:left-1/2 data-[press]:cursor-grabbing"
    ></div>
  `,
})
export class VoltSlider implements ControlValueAccessor {
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

  /** Access the slider state to wire up forms integration. */
  private readonly state = injectSliderState();
  protected readonly formControlState = injectFormControlState();

  readonly id = input<string>();
  readonly value = input<number, number>(0, { transform: numberAttribute });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
  readonly step = input<number, number>(1, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<NgpOrientation>('horizontal');
  readonly ariaLabel = input<string>();
  readonly valueChange = output<number>();

  private readonly controlDisabled = signal(false);
  private readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private writtenByForm = false;
  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      this.state().setDisabled(this.isDisabled());
    });

    // Like mirrorValue, but the template's `value` (default 0) must not overwrite what a form
    // control wrote first: `value` is an input here, not a model the form could also set.
    let first = true;
    effect(() => {
      const next = this.value();
      untracked(() => {
        if (!(first && this.writtenByForm)) {
          this.state().setValue(next, { emit: false });
        }
        first = false;
      });
    });
    this.state().valueChange.subscribe(value => {
      this.valueChange.emit(value);
      this.onChange(value);
    });
  }

  /**
   * A slider always shows a position, so it has no empty state to show for `null`: it returns to
   * where it rests without a form, its `value` input clamped into `min`/`max`. The control keeps
   * `null` until someone moves the thumb.
   */
  writeValue(value: number | null | undefined): void {
    this.writtenByForm = value != null;
    this.state().setValue(value ?? this.value(), { emit: false });
  }

  registerOnChange(fn: (value: number) => void): void {
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
