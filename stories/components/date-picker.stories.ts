import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  NgpDatePickerCellRender,
  NgpDatePickerRowRender,
  VoltDatePicker,
  VoltDatePickerCell,
  VoltDatePickerDateButton,
  VoltDatePickerGrid,
  VoltDatePickerLabel,
  VoltDatePickerNextMonth,
  VoltDatePickerPreviousMonth,
  VoltDateRangePicker,
} from 'volt';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const meta: Meta<VoltDatePicker> = {
  title: 'Components/Controls/Date Picker',
  component: VoltDatePicker,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        VoltDatePicker,
        VoltDateRangePicker,
        VoltDatePickerCell,
        VoltDatePickerDateButton,
        VoltDatePickerGrid,
        VoltDatePickerLabel,
        VoltDatePickerNextMonth,
        VoltDatePickerPreviousMonth,
        NgpDatePickerCellRender,
        NgpDatePickerRowRender,
      ],
    }),
  ],
  argTypes: {
    disabled: { control: 'boolean' },
    firstDayOfWeek: { control: 'select', options: [1, 2, 3, 4, 5, 6, 7] },
    dateChange: { action: 'dateChange' },
  },
  args: { disabled: false, firstDayOfWeek: 7 },
  render: args => {
    const focused = signal(new Date());
    return {
      props: {
        ...args,
        focused,
        weekDays: WEEK_DAYS,
        date: new FormControl<Date | null>(new Date()),
        label: () => focused().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      },
      template: `
        <volt-date-picker class="block w-72" [formControl]="date" [(focusedDate)]="focused" [disabled]="disabled" [firstDayOfWeek]="firstDayOfWeek" (dateChange)="dateChange($event)">
          <div class="flex items-center justify-between">
            <volt-date-picker-previous-month aria-label="Previous month">‹</volt-date-picker-previous-month>
            <volt-date-picker-label>{{ label() }}</volt-date-picker-label>
            <volt-date-picker-next-month aria-label="Next month">›</volt-date-picker-next-month>
          </div>
          <volt-date-picker-grid>
            <div class="text-muted-foreground grid grid-cols-7 gap-1 text-center text-xs">
              @for (day of weekDays; track day) { <span class="py-1">{{ day }}</span> }
            </div>
            <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
              <volt-date-picker-cell *ngpDatePickerCellRender="let day">
                <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
              </volt-date-picker-cell>
            </div>
          </volt-date-picker-grid>
        </volt-date-picker>
        <p class="text-muted-foreground mt-2 text-sm">Selected: {{ date.value?.toDateString() ?? 'none' }}</p>`,
    };
  },
};
export default meta;
type Story = StoryObj<VoltDatePicker>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const MondayFirst: Story = {
  name: 'Week starts on Monday',
  args: { firstDayOfWeek: 1 },
  render: args => {
    const focused = signal(new Date());
    return {
      props: {
        ...args,
        focused,
        weekDays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        label: () => focused().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      },
      template: `
        <volt-date-picker class="block w-72" [(focusedDate)]="focused" [firstDayOfWeek]="firstDayOfWeek">
          <div class="flex items-center justify-between">
            <volt-date-picker-previous-month aria-label="Previous month">‹</volt-date-picker-previous-month>
            <volt-date-picker-label>{{ label() }}</volt-date-picker-label>
            <volt-date-picker-next-month aria-label="Next month">›</volt-date-picker-next-month>
          </div>
          <volt-date-picker-grid>
            <div class="text-muted-foreground grid grid-cols-7 gap-1 text-center text-xs">
              @for (day of weekDays; track day) { <span class="py-1">{{ day }}</span> }
            </div>
            <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
              <volt-date-picker-cell *ngpDatePickerCellRender="let day">
                <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
              </volt-date-picker-cell>
            </div>
          </volt-date-picker-grid>
        </volt-date-picker>`,
    };
  },
};

export const Range: Story = {
  name: 'Date range',
  parameters: {
    docs: {
      description: {
        story:
          '`volt-date-range-picker` takes the same parts and reports `startDate` and `endDate`. Click a start date, then an end date.',
      },
    },
  },
  render: () => {
    const focused = signal(new Date());
    return {
      props: {
        focused,
        weekDays: WEEK_DAYS,
        label: () => focused().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      },
      template: `
        <volt-date-range-picker class="block w-72" [(focusedDate)]="focused">
          <div class="flex items-center justify-between">
            <volt-date-picker-previous-month aria-label="Previous month">‹</volt-date-picker-previous-month>
            <volt-date-picker-label>{{ label() }}</volt-date-picker-label>
            <volt-date-picker-next-month aria-label="Next month">›</volt-date-picker-next-month>
          </div>
          <volt-date-picker-grid>
            <div class="text-muted-foreground grid grid-cols-7 gap-1 text-center text-xs">
              @for (day of weekDays; track day) { <span class="py-1">{{ day }}</span> }
            </div>
            <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
              <volt-date-picker-cell *ngpDatePickerCellRender="let day">
                <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
              </volt-date-picker-cell>
            </div>
          </volt-date-picker-grid>
        </volt-date-range-picker>`,
    };
  },
};
