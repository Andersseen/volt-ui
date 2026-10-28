import {
  booleanAttribute,
  effect,
  untracked,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  computed,
} from '@angular/core';
import {
  injectDateRangePickerState,
  NgpDateRangePicker,
  provideDatePickerConfig,
} from 'ng-primitives/date-picker';
import { NgpNativeDateAdapter, provideDateAdapter } from 'ng-primitives/date-time';
import type { VoltDatePickerFirstDayOfWeek } from './date-picker';
import { sameDay } from './same-day';
import { cn } from '../../utils';

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
      ],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltDateRangePicker {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'grid w-fit gap-3 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-sm',
      this.class()
    )
  );

  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dateDisabled = input<(date: Date) => boolean>(() => false);
  readonly firstDayOfWeek = input<VoltDatePickerFirstDayOfWeek>(7);
  readonly startDate = model<Date | undefined>();
  readonly endDate = model<Date | undefined>();
  readonly focusedDate = model<Date | undefined>();

  private readonly state = injectDateRangePickerState<Date>();

  constructor() {
    // Volt owns the dates and mirrors them into the primitive without ever binding its own
    // inputs: ng-primitives latches into controlled mode the first time they are defined,
    // which froze a static `[startDate]`/`[endDate]` after the first click. Changes made by the
    // user come back through the primitive's change streams.
    effect(() => {
      const start = this.startDate();
      untracked(() => {
        if (!sameDay(start, this.state().startDate()))
          this.state().setStart(start as Date, { emit: false });
      });
    });
    effect(() => {
      const end = this.endDate();
      untracked(() => {
        if (!sameDay(end, this.state().endDate()))
          this.state().setEnd(end as Date, { emit: false });
      });
    });
    this.state().startDateChange.subscribe(value => this.startDate.set(value));
    this.state().endDateChange.subscribe(value => this.endDate.set(value));

    effect(() => {
      const focused = this.focusedDate();
      untracked(() => {
        if (focused && !sameDay(focused, this.state().focusedDate())) {
          this.state().setFocusedDate(focused, 'program', 'forward');
        }
      });
    });
    let firstFocused = true;
    effect(() => {
      const focused = this.state().focusedDate();
      untracked(() => {
        if (!firstFocused && !sameDay(focused, this.focusedDate())) this.focusedDate.set(focused);
        firstFocused = false;
      });
    });
  }
}
