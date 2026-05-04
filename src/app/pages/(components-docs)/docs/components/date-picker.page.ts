import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltDatePicker,
  VoltDatePickerGrid,
  VoltDatePickerLabel,
  VoltDatePickerNextMonth,
  VoltDatePickerPreviousMonth,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { DATE_PICKER_SNIPPET } from '../../../../lib/snippets';
import { DATE_PICKER_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-date-picker-demo',
  standalone: true,
  imports: [
    VoltDatePicker,
    VoltDatePickerGrid,
    VoltDatePickerLabel,
    VoltDatePickerNextMonth,
    VoltDatePickerPreviousMonth,
    CodePanel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Date Picker</h1>
        <p class="text-base text-muted-foreground mt-2">
          Calendar primitives for date and range selection.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-date-picker [(date)]="date">
            <div class="flex items-center justify-between">
              <volt-date-picker-previous-month>‹</volt-date-picker-previous-month>
              <volt-date-picker-label>May 2026</volt-date-picker-label>
              <volt-date-picker-next-month>›</volt-date-picker-next-month>
            </div>
            <volt-date-picker-grid>
              <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                @for (day of weekDays; track day) {
                  <span class="py-1">{{ day }}</span>
                }
              </div>
              <div class="grid grid-cols-7 gap-1">
                @for (day of days; track $index) {
                  <button
                    type="button"
                    class="size-9 rounded-[var(--radius-sm)] text-sm hover:bg-accent hover:text-accent-foreground"
                    [class.bg-primary]="day === 14"
                    [class.text-primary-foreground]="day === 14"
                    [class.text-muted-foreground]="!day"
                  >
                    {{ day || '' }}
                  </button>
                }
              </div>
            </volt-date-picker-grid>
          </volt-date-picker>
        </div>
      </app-code-panel>
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add date-picker"
        description="Copy this code to your project. The component uses ng-primitives/date-picker."
      />
    </div>
  `,
})
export default class DatePickerDemo {
  readonly code = DATE_PICKER_SNIPPET;
  readonly usage = DATE_PICKER_USAGE;
  readonly date = signal<Date | undefined>(new Date(2026, 4, 14));
  readonly weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly days = [
    0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];
}
