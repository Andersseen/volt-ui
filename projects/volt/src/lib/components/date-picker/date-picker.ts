import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpDatePicker, provideDatePickerConfig } from 'ng-primitives/date-picker';
import { NgpNativeDateAdapter, provideDateAdapter } from 'ng-primitives/date-time';

export type VoltDatePickerFirstDayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

@Component({
  selector: 'volt-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideDateAdapter(NgpNativeDateAdapter), provideDatePickerConfig({})],
  hostDirectives: [
    {
      directive: NgpDatePicker,
      inputs: [
        'ngpDatePickerMin: min',
        'ngpDatePickerMax: max',
        'ngpDatePickerDisabled: disabled',
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
      'grid w-fit gap-3 rounded-[var(--radius-md)] border border-border bg-popover p-3 text-popover-foreground shadow-sm',
  },
  template: `<ng-content />`,
})
export class VoltDatePicker {
  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly disabled = input<boolean>(false);
  readonly dateDisabled = input<(date: Date) => boolean>(() => false);
  readonly firstDayOfWeek = input<VoltDatePickerFirstDayOfWeek>(7);
  readonly date = model<Date | undefined>();
  readonly focusedDate = model<Date>(new Date());
}
