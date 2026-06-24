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
import { NgpDatePicker, provideDatePickerConfig } from 'ng-primitives/date-picker';
import { NgpNativeDateAdapter, provideDateAdapter } from 'ng-primitives/date-time';

export type VoltDatePickerFirstDayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

@Component({
  selector: 'volt-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideDateAdapter(NgpNativeDateAdapter),
    provideDatePickerConfig({}),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltDatePicker),
      multi: true,
    },
  ],
  hostDirectives: [
    {
      directive: NgpDatePicker,
      inputs: [
        'ngpDatePickerMin: min',
        'ngpDatePickerMax: max',
        'ngpDatePickerDisabled: isDisabled',
        'ngpDatePickerDateDisabled: dateDisabled',
        'ngpDatePickerFirstDayOfWeek: firstDayOfWeek',
        'ngpDatePickerDate: date',
        'ngpDatePickerFocusedDate: focusedDate',
      ],
      outputs: [
        'ngpDatePickerDateChange: dateChange',
        'ngpDatePickerFocusedDateChange: focusedDateChange',
      ],
    },
  ],
  host: {
    class:
      'grid w-fit gap-3 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-sm',
  },
  template: `<ng-content />`,
})
export class VoltDatePicker implements ControlValueAccessor {
  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dateDisabled = input<(date: Date) => boolean>(() => false);
  readonly firstDayOfWeek = input<VoltDatePickerFirstDayOfWeek>(7);
  readonly date = model<Date | undefined>();
  readonly focusedDate = model<Date>(new Date());

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: Date | undefined) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const value = this.date();
      this.onChange(value);
    });
  }

  writeValue(value: Date | undefined | null): void {
    this.date.set(value ?? undefined);
  }

  registerOnChange(fn: (value: Date | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
