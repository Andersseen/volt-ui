import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NgpDatePickerCellRender, NgpDatePickerRowRender } from 'ng-primitives/date-picker';
import { VoltDatePickerCell } from './date-picker-cell';
import { VoltDatePickerDateButton } from './date-picker-date-button';
import { VoltDatePickerGrid } from './date-picker-grid';
import { VoltDatePickerLabel } from './date-picker-label';
import { VoltDateRangePicker } from './date-range-picker';

@Component({
  imports: [
    VoltDateRangePicker,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    VoltDatePickerGrid,
    VoltDatePickerLabel,
    NgpDatePickerCellRender,
    NgpDatePickerRowRender,
  ],
  template: `
    <volt-date-range-picker
      [(startDate)]="start"
      [(endDate)]="end"
      [(focusedDate)]="focused"
      [dateDisabled]="blocked"
    >
      <volt-date-picker-label>{{ month() }}</volt-date-picker-label>
      <volt-date-picker-grid>
        <div *ngpDatePickerRowRender>
          <volt-date-picker-cell *ngpDatePickerCellRender="let day">
            <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
          </volt-date-picker-cell>
        </div>
      </volt-date-picker-grid>
    </volt-date-range-picker>
  `,
})
class RangeFixture {
  // Deliberately months away from "today", so nothing passes by being on the default month.
  readonly start = signal<Date | undefined>(new Date(2031, 2, 10));
  readonly end = signal<Date | undefined>(new Date(2031, 2, 13));
  readonly focused = signal<Date | undefined>(undefined);
  /** 2031-03-20 is unavailable. */
  readonly blocked = (date: Date): boolean =>
    date.getFullYear() === 2031 && date.getMonth() === 2 && date.getDate() === 20;
  readonly month = () =>
    (this.focused() ?? new Date()).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

const day = (n: number): HTMLElement =>
  screen
    .getAllByText(String(n), { selector: 'volt-date-picker-date-button' })
    .filter(el => !el.hasAttribute('data-outside-month'))[0];

describe('VoltDateRangePicker', () => {
  it('opens on the month of a start date set from outside, with the range marked', async () => {
    await render(RangeFixture);

    expect(screen.getByText('March 2031')).toBeInTheDocument();
    expect(day(10)).toHaveAttribute('data-range-start');
    expect(day(13)).toHaveAttribute('data-range-end');
    expect(day(11)).toHaveAttribute('data-range-between');
    expect(day(12)).toHaveAttribute('data-range-between');
    expect(day(14)).not.toHaveAttribute('data-range-between');
  });

  it('a pointer start-then-end selection writes both dates back', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(RangeFixture);
    fixture.componentInstance.start.set(undefined);
    fixture.componentInstance.end.set(undefined);
    await fixture.whenStable();

    await user.click(day(3));
    await user.click(day(6));
    await fixture.whenStable();

    expect(fixture.componentInstance.start()).toEqual(new Date(2031, 2, 3));
    expect(fixture.componentInstance.end()).toEqual(new Date(2031, 2, 6));
    expect(day(4)).toHaveAttribute('data-range-between');
  });

  it('a programmatic range change moves the marks without emitting back', async () => {
    const { fixture } = await render(RangeFixture);

    fixture.componentInstance.start.set(new Date(2031, 2, 24));
    fixture.componentInstance.end.set(new Date(2031, 2, 26));
    await fixture.whenStable();

    expect(day(24)).toHaveAttribute('data-range-start');
    expect(day(26)).toHaveAttribute('data-range-end');
    expect(day(10)).not.toHaveAttribute('data-range-start');
  });

  it('a disabled day cannot start a range', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(RangeFixture);
    fixture.componentInstance.start.set(undefined);
    fixture.componentInstance.end.set(undefined);
    await fixture.whenStable();

    await user.click(day(20), { pointerEventsCheck: 0 });
    await fixture.whenStable();

    expect(day(20)).toHaveAttribute('aria-disabled', 'true');
    expect(fixture.componentInstance.start()).toBeUndefined();
  });
});
