import { Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NgpDatePickerCellRender, NgpDatePickerRowRender } from 'ng-primitives/date-picker';
import { VoltDatePicker } from './date-picker';
import { VoltDatePickerCell } from './date-picker-cell';
import { VoltDatePickerDateButton } from './date-picker-date-button';
import { VoltDatePickerGrid } from './date-picker-grid';
import { VoltDatePickerLabel } from './date-picker-label';
import { VoltDatePickerNextMonth } from './date-picker-next-month';
import { VoltDatePickerPreviousMonth } from './date-picker-previous-month';

/**
 * Mirrors the documented usage exactly — a bare `<volt-date-picker>` renders no calendar
 * at all, so testing anything real means composing the full grid the way consumers do.
 */
@Component({
  imports: [
    ReactiveFormsModule,
    VoltDatePicker,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    VoltDatePickerGrid,
    VoltDatePickerLabel,
    VoltDatePickerNextMonth,
    VoltDatePickerPreviousMonth,
    NgpDatePickerCellRender,
    NgpDatePickerRowRender,
  ],
  template: `
    <volt-date-picker
      [formControl]="control"
      [(focusedDate)]="focusedDate"
      [dateDisabled]="dateDisabled"
      aria-label="Date"
    >
      <div>
        <volt-date-picker-previous-month aria-label="Previous month">
          &lsaquo;
        </volt-date-picker-previous-month>
        <volt-date-picker-label>{{ label() }}</volt-date-picker-label>
        <volt-date-picker-next-month aria-label="Next month">&rsaquo;</volt-date-picker-next-month>
      </div>

      <volt-date-picker-grid>
        <div *ngpDatePickerRowRender>
          <volt-date-picker-cell *ngpDatePickerCellRender="let day">
            <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
          </volt-date-picker-cell>
        </div>
      </volt-date-picker-grid>
    </volt-date-picker>
  `,
})
class DatePickerFixture {
  readonly control = new FormControl<Date | null>(new Date(2026, 6, 29));
  readonly focusedDate = signal(new Date(2026, 6, 29));
  readonly label = computed(() =>
    this.focusedDate().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  );
  // 2026-07-15 is unselectable, to prove dateDisabled reaches the rendered buttons.
  readonly dateDisabled = (date: Date): boolean =>
    date.getFullYear() === 2026 && date.getMonth() === 6 && date.getDate() === 15;
}

/** The calendar renders leading/trailing days too, so scope lookups to the focused month. */
function dateButton(day: string): HTMLElement {
  const matches = screen
    .getAllByText(day, { selector: 'volt-date-picker-date-button' })
    .filter(el => !el.hasAttribute('data-outside-month'));
  return matches[0];
}

describe('VoltDatePicker', () => {
  it('implement the Reactive Forms value and disabled contracts', async () => {
    const { fixture, container } = await render(DatePickerFixture);
    const picker = container.querySelector('volt-date-picker');
    const nextDate = new Date(2026, 7, 1);

    expect(picker).toBeInTheDocument();
    expect(fixture.componentInstance.control.value).toEqual(new Date(2026, 6, 29));

    fixture.componentInstance.control.setValue(nextDate);
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toEqual(nextDate);

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.disabled).toBe(true);
  });

  it('renders the focused month as a labelled grid', async () => {
    await render(DatePickerFixture);

    expect(screen.getByText('July 2026')).toBeInTheDocument();
    // July 2026 has 31 days; every one of them must be rendered as a button.
    for (const day of ['1', '15', '29', '31']) {
      expect(dateButton(day)).toBeInTheDocument();
    }
    expect(dateButton('29')).toHaveAttribute('data-selected');
  });

  it('selects a date when its cell is clicked and writes it back to the form', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(DatePickerFixture);

    await user.click(dateButton('4'));
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toEqual(new Date(2026, 6, 4));
    expect(dateButton('4')).toHaveAttribute('data-selected');
    expect(dateButton('29')).not.toHaveAttribute('data-selected');
  });

  it('does not select a date rejected by dateDisabled', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(DatePickerFixture);

    const disabledDay = dateButton('15');
    expect(disabledDay).toHaveAttribute('data-disabled');

    await user.click(disabledDay);
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toEqual(new Date(2026, 6, 29));
    expect(disabledDay).not.toHaveAttribute('data-selected');
  });

  it('moves between months with the previous/next controls', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(DatePickerFixture);

    await user.click(screen.getByLabelText('Next month'));
    await fixture.whenStable();
    expect(screen.getByText('August 2026')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Previous month'));
    await user.click(screen.getByLabelText('Previous month'));
    await fixture.whenStable();
    expect(screen.getByText('June 2026')).toBeInTheDocument();

    // Navigating the calendar must not change the committed value.
    expect(fixture.componentInstance.control.value).toEqual(new Date(2026, 6, 29));
  });
});
