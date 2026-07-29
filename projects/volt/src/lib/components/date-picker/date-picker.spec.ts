import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { VoltDatePicker } from './date-picker';

@Component({
  imports: [ReactiveFormsModule, VoltDatePicker],
  template: `<volt-date-picker [formControl]="control" aria-label="Date" />`,
})
class DatePickerFixture {
  readonly control = new FormControl<Date | null>(new Date(2026, 6, 29));
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
});
