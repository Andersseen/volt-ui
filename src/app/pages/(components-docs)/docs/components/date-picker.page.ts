import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  NgpDatePickerCellRender,
  NgpDatePickerRowRender,
  VoltDatePickerCell,
  VoltDatePickerDateButton,
  VoltDatePicker,
  VoltDatePickerGrid,
  VoltDatePickerLabel,
  VoltDatePickerNextMonth,
  VoltDatePickerPreviousMonth,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { DATE_PICKER_SNIPPET } from '../../../../lib/snippets';
import { DATE_PICKER_USAGE } from '../../../../lib/snippets/usage';
import { DATE_PICKER_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-date-picker-demo',
  standalone: true,
  imports: [
    VoltDatePicker,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    VoltDatePickerGrid,
    VoltDatePickerLabel,
    VoltDatePickerNextMonth,
    VoltDatePickerPreviousMonth,
    NgpDatePickerCellRender,
    NgpDatePickerRowRender,
    CodePanel,
    ApiReference,
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
          <volt-date-picker [(date)]="date" [(focusedDate)]="focusedDate">
            <div class="flex items-center justify-between">
              <volt-date-picker-previous-month aria-label="Previous month">
                ‹
              </volt-date-picker-previous-month>
              <volt-date-picker-label>{{ label() }}</volt-date-picker-label>
              <volt-date-picker-next-month aria-label="Next month"> › </volt-date-picker-next-month>
            </div>
            <volt-date-picker-grid>
              <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                @for (day of weekDays; track day) {
                  <span class="py-1">{{ day }}</span>
                }
              </div>
              <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
                <volt-date-picker-cell *ngpDatePickerCellRender="let day">
                  <volt-date-picker-date-button>
                    {{ day.getDate() }}
                  </volt-date-picker-date-button>
                </volt-date-picker-cell>
              </div>
            </volt-date-picker-grid>
          </volt-date-picker>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">API Reference</h3>
        <app-api-reference [data]="datePickerApi" />
      </div>

      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx @voltui/cli add date-picker"
        description="Copy this code to your project. The component uses ng-primitives/date-picker."
      />
    </div>
  `,
})
export default class DatePickerDemo {
  readonly datePickerApi = DATE_PICKER_API;
  readonly code = DATE_PICKER_SNIPPET;
  readonly usage = DATE_PICKER_USAGE;
  readonly date = signal<Date | undefined>(new Date(2026, 4, 14));
  readonly focusedDate = signal<Date>(new Date(2026, 4, 14));
  readonly label = computed(() =>
    this.focusedDate().toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  );
  readonly weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
}
