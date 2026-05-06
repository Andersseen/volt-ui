import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpDateRangePicker, provideDatePickerConfig } from 'ng-primitives/date-picker';
import { NgpNativeDateAdapter, provideDateAdapter } from 'ng-primitives/date-time';
import type { VoltDatePickerFirstDayOfWeek } from './date-picker';

@Component({
  selector: 'volt-date-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideDateAdapter(NgpNativeDateAdapter), provideDatePickerConfig({})],
  hostDirectives: [
    {
      directive: NgpDateRangePicker,
      inputs: [
        'ngpDateRangePickerMin: min',
        'ngpDateRangePickerMax: max',
        'ngpDateRangePickerDisabled: disabled',
        'ngpDateRangePickerDateDisabled: dateDisabled',
        'ngpDateRangePickerFirstDayOfWeek: firstDayOfWeek',
        'ngpDateRangePickerStartDate: startDate',
        'ngpDateRangePickerEndDate: endDate',
        'ngpDateRangePickerFocusedDate: focusedDate',
      ],
      outputs: [
        'ngpDateRangePickerStartDateChange: startDateChange',
        'ngpDateRangePickerEndDateChange: endDateChange',
        'ngpDateRangePickerFocusedDateChange: focusedDateChange',
      ],
    },
  ],
  host: {
    class:
      'grid w-fit gap-3 rounded-[var(--radius-md)] border border-border bg-popover p-3 text-popover-foreground shadow-sm',
  },
  template: `<ng-content />`,
})
export class VoltDateRangePicker {
  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly disabled = input<boolean>(false);
  readonly dateDisabled = input<(date: Date) => boolean>(() => false);
  readonly firstDayOfWeek = input<VoltDatePickerFirstDayOfWeek>(7);
  readonly startDate = model<Date | undefined>();
  readonly endDate = model<Date | undefined>();
  readonly focusedDate = model<Date>(new Date());
}
