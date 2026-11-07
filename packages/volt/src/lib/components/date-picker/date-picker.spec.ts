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

  it('exposes the month controls as keyboard-operable buttons', async () => {
    const user = userEvent.setup();
    await render(DatePickerFixture);

    const next = screen.getByRole('button', { name: 'Next month' });
    const previous = screen.getByRole('button', { name: 'Previous month' });
    expect(next).toHaveAttribute('tabindex', '0');
    expect(previous).toHaveAttribute('tabindex', '0');

    next.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('August 2026')).toBeInTheDocument();
    await user.keyboard(' ');
    expect(screen.getByText('September 2026')).toBeInTheDocument();

    previous.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('August 2026')).toBeInTheDocument();
  });

  it('names every day with its full date, not just the number', async () => {
    await render(DatePickerFixture);
    expect(screen.getByRole('button', { name: 'Wednesday, July 29, 2026' })).toBe(dateButton('29'));
    // The selected state is on the gridcell that owns the button.
    expect(dateButton('29').closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
  });

  it('a programmatic write is silent: the control stays pristine and untouched', async () => {
    const { fixture } = await render(DatePickerFixture);
    const control = fixture.componentInstance.control;
    let emitted = 0;
    control.valueChanges.subscribe(() => emitted++);

    control.setValue(new Date(2026, 6, 10));
    await fixture.whenStable();

    expect(emitted).toBe(1); // setValue's own emission, no echo from the calendar
    expect(control.pristine).toBe(true);
    expect(control.touched).toBe(false);
    expect(dateButton('10')).toHaveAttribute('data-selected');
  });

  it('one user selection emits exactly one change and marks the control dirty', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(DatePickerFixture);
    const control = fixture.componentInstance.control;
    let emitted = 0;
    control.valueChanges.subscribe(() => emitted++);

    await user.click(dateButton('8'));
    await fixture.whenStable();

    expect(emitted).toBe(1);
    expect(control.dirty).toBe(true);
    expect(control.value).toEqual(new Date(2026, 6, 8));
  });

  it('selects from the keyboard: arrows move focus, Enter commits', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(DatePickerFixture);

    dateButton('29').focus();
    await user.keyboard('{ArrowRight}');
    await fixture.whenStable();
    expect(dateButton('30')).toHaveFocus();
    await user.keyboard('{Enter}');
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toEqual(new Date(2026, 6, 30));
  });

  it('is touched only when focus leaves the calendar, not while it moves between days', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(DatePickerFixture);
    const control = fixture.componentInstance.control;

    dateButton('29').focus();
    await user.keyboard('{ArrowLeft}{ArrowUp}');
    await fixture.whenStable();
    expect(control.touched).toBe(false);

    (document.activeElement as HTMLElement).blur();
    await fixture.whenStable();
    expect(control.touched).toBe(true);
  });

  it('reset() clears the selection; a disabled control cannot be changed', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(DatePickerFixture);
    const control = fixture.componentInstance.control;

    control.reset();
    await fixture.whenStable();
    expect(control.value).toBeNull();
    expect(document.querySelector('volt-date-picker-date-button[data-selected]')).toBeNull();

    control.disable();
    await fixture.whenStable();
    await user.click(dateButton('3'), { pointerEventsCheck: 0 });
    await fixture.whenStable();
    expect(control.value).toBeNull();
    expect(dateButton('3')).toHaveAttribute('aria-disabled', 'true');
  });
});

@Component({
  imports: [
    VoltDatePicker,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    VoltDatePickerGrid,
    NgpDatePickerCellRender,
    NgpDatePickerRowRender,
  ],
  template: `
    <volt-date-picker [focusedDate]="focused">
      <volt-date-picker-grid>
        <div *ngpDatePickerRowRender>
          <volt-date-picker-cell *ngpDatePickerCellRender="let day">
            <volt-date-picker-date-button
              [attr.data-day]="day.getDate()"
              [aria-label]="day.getDate() === 4 ? 'Independence Day' : undefined"
              >{{ day.getDate() }}</volt-date-picker-date-button
            >
          </volt-date-picker-cell>
        </div>
      </volt-date-picker-grid>
    </volt-date-picker>
  `,
})
class LabelledDayFixture {
  readonly focused = new Date(2026, 6, 1);
}

describe('VoltDatePickerDateButton accessible name', () => {
  it('keeps a consumer aria-label over the generated full date', async () => {
    await render(LabelledDayFixture);
    expect(screen.getByRole('button', { name: 'Independence Day' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sunday, July 5, 2026' })).toBeInTheDocument();
  });
});

@Component({
  imports: [
    ReactiveFormsModule,
    VoltDatePicker,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    VoltDatePickerGrid,
    NgpDatePickerCellRender,
    NgpDatePickerRowRender,
  ],
  template: `
    <volt-date-picker [formControl]="control" [(focusedDate)]="focused">
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
class FarMonthFixture {
  // Years from "today", and no focusedDate given: the picker must move and say so.
  readonly control = new FormControl<Date | null>(new Date(2031, 2, 10));
  readonly focused = signal<Date | undefined>(undefined);
}

describe('VoltDatePicker month of an outside value', () => {
  it('opens on the written month and reports it through [(focusedDate)]', async () => {
    const { fixture } = await render(FarMonthFixture);
    await fixture.whenStable();

    expect(screen.getByRole('button', { name: 'Monday, March 10, 2031' })).toHaveAttribute(
      'data-selected'
    );
    const focused = fixture.componentInstance.focused();
    expect(focused?.getFullYear()).toBe(2031);
    expect(focused?.getMonth()).toBe(2);
  });
});
