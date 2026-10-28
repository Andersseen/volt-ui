import { signal, type WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpDatePickerCellRender, NgpDatePickerRowRender } from 'ng-primitives/date-picker';
import { describe, expect, it, vi } from 'vitest';
import {
  VoltCombobox,
  VoltDatePicker,
  VoltDatePickerCell,
  VoltDatePickerDateButton,
  VoltDatePickerGrid,
  VoltInputOtp,
  VoltPopoverContent,
  VoltPopoverTrigger,
  VoltRangeSlider,
  VoltResizable,
  VoltResizableHandle,
  VoltResizablePanel,
} from '../public-api';

/** Second batch of the interaction contracts — see interaction-contract.spec.ts. */
async function set<T>(fixture: ComponentFixture<unknown>, name: string, value: T): Promise<void> {
  (fixture.componentInstance as Record<string, WritableSignal<T>>)[name].set(value);
  await fixture.whenStable();
}

describe('combobox forms and dynamic binding', () => {
  const items = ['Angular', 'React', 'Vue'];
  const tpl = (attrs: string) =>
    `<volt-combobox label="Framework" [items]="items" ${attrs}><ng-template let-item>{{ item }}</ng-template></volt-combobox>`;

  it('a dynamic [value] shows its label and the combobox stays selectable afterwards', async () => {
    const { fixture } = await render(tpl('[value]="v()"'), {
      imports: [VoltCombobox],
      componentProperties: { items, v: signal<string | undefined>('Angular') },
    });
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Angular');
    await set(fixture, 'v', 'Vue');
    expect(input).toHaveValue('Vue');
    const user = userEvent.setup();
    await user.click(input);
    await user.click(await screen.findByRole('option', { name: 'React' }));
    expect(input).toHaveValue('React');
  });

  it('works in a template-driven form', async () => {
    const { fixture } = await render(tpl('[(ngModel)]="v"'), {
      imports: [VoltCombobox, FormsModule],
      componentProperties: { items, v: 'React' },
    });
    await fixture.whenStable();
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('React');
    const user = userEvent.setup();
    await user.click(input);
    await user.click(await screen.findByRole('option', { name: 'Vue' }));
    expect((fixture.componentInstance as { v: string }).v).toBe('Vue');
  });

  it('a touched, required, empty control is announced as invalid', async () => {
    const c = new FormControl<string | null>(null, [Validators.required]);
    await render(tpl('[formControl]="c"'), {
      imports: [VoltCombobox, ReactiveFormsModule],
      componentProperties: { items, c },
    });
    const input = screen.getByRole('combobox');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
    const user = userEvent.setup();
    await user.click(input);
    await user.tab();
    expect(c.touched).toBe(true);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('clicking outside closes the list without changing the value', async () => {
    await render(tpl('value="Angular"'), {
      imports: [VoltCombobox],
      componentProperties: { items },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    await user.click(document.body);
    await vi.waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(screen.getByRole('combobox')).toHaveValue('Angular');
  });
});

describe('range-slider dynamic binding, emissions and forms', () => {
  const tpl = (attrs: string) =>
    `<volt-range-slider ariaLabelLow="Low" ariaLabelHigh="High" ${attrs} />`;

  it('dynamic [low]/[high] reach the DOM (a parent update is not a user change), and each keystroke emits exactly once', async () => {
    const lowChange = vi.fn();
    const highChange = vi.fn();
    const { fixture } = await render(
      tpl(
        '[low]="l()" [high]="h()" (lowChange)="lowChange($event)" (highChange)="highChange($event)"'
      ),
      {
        imports: [VoltRangeSlider],
        componentProperties: { l: signal(10), h: signal(90), lowChange, highChange },
      }
    );
    const [low, high] = screen.getAllByRole('slider');
    await set(fixture, 'l', 30);
    await set(fixture, 'h', 70);
    expect(low).toHaveAttribute('aria-valuenow', '30');
    expect(high).toHaveAttribute('aria-valuenow', '70');
    // A parent update is not a user change.
    expect(lowChange).not.toHaveBeenCalled();
    expect(highChange).not.toHaveBeenCalled();

    low.focus();
    const user = userEvent.setup();
    await user.keyboard('{ArrowRight}');
    expect(low).toHaveAttribute('aria-valuenow', '31');
    expect(lowChange).toHaveBeenCalledTimes(1);
    expect(lowChange).toHaveBeenCalledWith(31);
    expect(highChange).not.toHaveBeenCalled();
  });

  it('a Reactive Forms setValue moves both thumbs without emitting, even when the range jumps', async () => {
    const c = new FormControl<[number, number]>([10, 20], { nonNullable: true });
    const lowChange = vi.fn();
    const { fixture } = await render(tpl('[formControl]="c" (lowChange)="lowChange($event)"'), {
      imports: [VoltRangeSlider, ReactiveFormsModule],
      componentProperties: { c, lowChange },
    });
    c.setValue([60, 90]);
    await fixture.whenStable();
    const [low, high] = screen.getAllByRole('slider');
    expect(low).toHaveAttribute('aria-valuenow', '60');
    expect(high).toHaveAttribute('aria-valuenow', '90');
    expect(lowChange).not.toHaveBeenCalled();
  });

  it('disabling the control disables both thumbs, and re-enabling restores the keyboard', async () => {
    const c = new FormControl<[number, number]>([20, 80], { nonNullable: true });
    const { fixture } = await render(tpl('[formControl]="c"'), {
      imports: [VoltRangeSlider, ReactiveFormsModule],
      componentProperties: { c },
    });
    c.disable();
    await fixture.whenStable();
    const [low] = screen.getAllByRole('slider');
    low.focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(c.value).toEqual([20, 80]);
    c.enable();
    await fixture.whenStable();
    low.focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(c.value).toEqual([21, 80]);
  });
});

describe('date-picker forms', () => {
  const picker = `<volt-date-picker [formControl]="c" aria-label="Date">
    <volt-date-picker-grid><div *ngpDatePickerRowRender><volt-date-picker-cell *ngpDatePickerCellRender="let day"><volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button></volt-date-picker-cell></div></volt-date-picker-grid>
  </volt-date-picker>
  <button type="button">after</button>`;
  const imports = [
    ReactiveFormsModule,
    VoltDatePicker,
    VoltDatePickerGrid,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    NgpDatePickerRowRender,
    NgpDatePickerCellRender,
  ];

  it('marks the control touched when focus leaves the calendar, not while it moves inside it', async () => {
    const c = new FormControl<Date | null>(new Date(2026, 6, 15));
    await render(picker, { imports, componentProperties: { c } });
    const user = userEvent.setup();
    const days = screen.getAllByText(/^\d+$/, { selector: 'volt-date-picker-date-button' });
    days[10].focus();
    await user.keyboard('{ArrowRight}');
    expect(c.touched).toBe(false);
    await user.click(screen.getByRole('button', { name: 'after' }));
    expect(c.touched).toBe(true);
  });
});

describe('input-otp forms', () => {
  it('works in a template-driven form and reports completion', async () => {
    const complete = vi.fn();
    const { fixture } = await render(
      `<volt-input-otp [length]="4" [(ngModel)]="code" (complete)="complete($event)" />`,
      { imports: [VoltInputOtp, FormsModule], componentProperties: { code: '', complete } }
    );
    await fixture.whenStable();
    await userEvent.setup().type(screen.getByRole('textbox'), '1234');
    expect((fixture.componentInstance as { code: string }).code).toBe('1234');
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledWith('1234');
  });

  it('a touched, incomplete required control is announced as invalid', async () => {
    const c = new FormControl('', [Validators.required, Validators.minLength(4)]);
    await render(
      `<volt-input-otp [length]="4" [formControl]="c" /><button type="button">after</button>`,
      {
        imports: [VoltInputOtp, ReactiveFormsModule],
        componentProperties: { c },
      }
    );
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), '12');
    await user.click(screen.getByRole('button', { name: 'after' }));
    expect(c.touched).toBe(true);
    expect(document.querySelector('volt-input-otp')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('popover', () => {
  const tpl = (attrs = '') => `
    <button type="button" [voltPopover]="tpl" ${attrs}>Open popover</button>
    <ng-template #tpl><volt-popover-content>Popover body</volt-popover-content></ng-template>`;

  it('reports each open and close once, and Escape closes it', async () => {
    const openChange = vi.fn();
    await render(tpl('(openChange)="openChange($event)"'), {
      imports: [VoltPopoverTrigger, VoltPopoverContent],
      componentProperties: { openChange },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(await screen.findByText('Popover body')).toBeInTheDocument();
    expect(openChange.mock.calls).toEqual([[true]]);
    await user.keyboard('{Escape}');
    await vi.waitFor(() => expect(screen.queryByText('Popover body')).toBeNull());
    expect(openChange.mock.calls).toEqual([[true], [false]]);
  });

  it('a disabled trigger does not open it', async () => {
    await render(tpl('[disabled]="true"'), {
      imports: [VoltPopoverTrigger, VoltPopoverContent],
    });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open popover' }));
    expect(screen.queryByText('Popover body')).toBeNull();
  });
});

describe('resizable', () => {
  it('exposes the separator’s orientation and value range, and keyboard resizing updates the value', async () => {
    await render(
      `<volt-resizable orientation="horizontal"><volt-resizable-panel>L</volt-resizable-panel><volt-resizable-handle /><volt-resizable-panel>R</volt-resizable-panel></volt-resizable>`,
      { imports: [VoltResizable, VoltResizablePanel, VoltResizableHandle] }
    );
    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    expect(handle).toHaveAttribute('aria-valuemin', '0');
    expect(handle).toHaveAttribute('tabindex', '0');
    const before = Number(handle.getAttribute('aria-valuenow'));
    handle.focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(Number(handle.getAttribute('aria-valuenow'))).not.toBe(before);
  });
});
