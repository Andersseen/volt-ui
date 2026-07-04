import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectRadioGroupState, NgpRadioGroup, provideRadioGroupState } from 'ng-primitives/radio';
import type { NgpOrientation } from 'ng-primitives/common';
import { injectFormControlState } from '../../form-control-state';

@Component({
  selector: 'volt-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideRadioGroupState(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltRadioGroup),
      multi: true,
    },
  ],
  host: {
    class: 'flex gap-2',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '[class.flex-col]': 'orientation() === "vertical"',
    '[class.flex-row]': 'orientation() === "horizontal"',
    '(focusout)': 'onTouched()',
  },
  hostDirectives: [
    {
      directive: NgpRadioGroup,
      inputs: [
        'id: id',
        'ngpRadioGroupValue: value',
        'ngpRadioGroupDisabled: disabled',
        'ngpRadioGroupOrientation: orientation',
        'ngpRadioGroupCompareWith: compareWith',
      ],
      outputs: ['ngpRadioGroupValueChange: valueChange'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltRadioGroup implements ControlValueAccessor {
  private readonly state = injectRadioGroupState<string>();
  protected readonly formControlState = injectFormControlState();

  readonly id = input<string>();
  readonly orientation = input<NgpOrientation>('vertical');
  readonly value = model<string | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly compareWith = input<(a: string | null, b: string | null) => boolean>(Object.is);

  private readonly controlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string | null) => void = () => {};
  protected onTouched: () => void = () => {};
  private isWritingValue = false;
  private hasObservedStateValue = false;

  constructor() {
    effect(() => {
      this.state().disabled.set(this.isDisabled());
    });

    effect(() => {
      const value = this.state().value();
      this.value.set(value);

      if (this.isWritingValue) {
        return;
      }

      if (this.hasObservedStateValue) {
        this.onChange(value);
      }

      this.hasObservedStateValue = true;
    });
  }

  writeValue(value: string | null | undefined): void {
    const nextValue = value ?? null;
    this.isWritingValue = true;
    this.value.set(nextValue);
    this.state().value.set(nextValue);
    this.isWritingValue = false;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
    this.state().disabled.set(this.isDisabled());
  }
}
