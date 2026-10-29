import { signal, type WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { NgpDatePickerCellRender, NgpDatePickerRowRender } from 'ng-primitives/date-picker';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltCheckbox,
  VoltCombobox,
  VoltDatePicker,
  VoltDatePickerCell,
  VoltDatePickerDateButton,
  VoltDatePickerGrid,
  VoltDateRangePicker,
  VoltNavigationMenu,
  VoltNavigationMenuContent,
  VoltNavigationMenuContentItem,
  VoltNavigationMenuItem,
  VoltNavigationMenuList,
  VoltNavigationMenuTrigger,
  VoltListbox,
  VoltListboxOption,
  VoltRadioGroup,
  VoltRadioItem,
  VoltRangeSlider,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSlider,
  VoltSwitch,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltToggle,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from '../public-api';

/** Drives a parent-owned `signal` that the template binds, then waits for the DOM to settle. */
async function set<T>(fixture: ComponentFixture<unknown>, name: string, value: T): Promise<void> {
  (fixture.componentInstance as Record<string, WritableSignal<T>>)[name].set(value);
  await fixture.whenStable();
}

/**
 * Stateful value contract — the dimensions `static-value.spec.ts` does not reach.
 *
 * For each stateful component, observed through the DOM / ARIA state:
 *   - dynamic one-way binding: a parent `[value]` update reaches the DOM, and the component is
 *     still interactive afterwards (a primitive latched into controlled mode would not be);
 *   - one user action → exactly one public emission;
 *   - a programmatic write → no emission (it is not a user change).
 */
describe('one user action emits exactly once', () => {
  it('radio-group', async () => {
    const valueChange = vi.fn();
    await render(
      `<volt-radio-group value="a" (valueChange)="valueChange($event)"><volt-radio-item value="a">A</volt-radio-item><volt-radio-item value="b">B</volt-radio-item></volt-radio-group>`,
      { imports: [VoltRadioGroup, VoltRadioItem], componentProperties: { valueChange } }
    );
    await userEvent.setup().click(screen.getByRole('radio', { name: 'B' }));
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenCalledWith('b');
  });

  it('toggle-group', async () => {
    const valueChange = vi.fn();
    await render(
      `<volt-toggle-group [value]="['a']" (valueChange)="valueChange($event)"><volt-toggle-group-item value="a">A</volt-toggle-group-item><volt-toggle-group-item value="b">B</volt-toggle-group-item></volt-toggle-group>`,
      { imports: [VoltToggleGroup, VoltToggleGroupItem], componentProperties: { valueChange } }
    );
    await userEvent.setup().click(screen.getByRole('radio', { name: 'B' }));
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenCalledWith(['b']);
  });

  it('listbox', async () => {
    const valueChange = vi.fn();
    await render(
      `<volt-listbox [value]="['a']" aria-label="L" (valueChange)="valueChange($event)"><volt-listbox-option value="a">A</volt-listbox-option><volt-listbox-option value="b">B</volt-listbox-option></volt-listbox>`,
      { imports: [VoltListbox, VoltListboxOption], componentProperties: { valueChange } }
    );
    await userEvent.setup().click(screen.getByRole('option', { name: 'B' }));
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenCalledWith(['b']);
  });

  it('slider', async () => {
    const valueChange = vi.fn();
    await render(`<volt-slider [value]="40" ariaLabel="S" (valueChange)="valueChange($event)" />`, {
      imports: [VoltSlider],
      componentProperties: { valueChange },
    });
    screen.getByRole('slider').focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenCalledWith(41);
  });

  it('checkbox', async () => {
    const checkedChange = vi.fn();
    await render(`<volt-checkbox aria-label="C" (checkedChange)="checkedChange($event)" />`, {
      imports: [VoltCheckbox],
      componentProperties: { checkedChange },
    });
    await userEvent.setup().click(screen.getByRole('checkbox'));
    expect(checkedChange).toHaveBeenCalledTimes(1);
    expect(checkedChange).toHaveBeenCalledWith(true);
  });

  it('switch', async () => {
    const checkedChange = vi.fn();
    await render(`<volt-switch aria-label="S" (checkedChange)="checkedChange($event)" />`, {
      imports: [VoltSwitch],
      componentProperties: { checkedChange },
    });
    await userEvent.setup().click(screen.getByRole('switch'));
    expect(checkedChange).toHaveBeenCalledTimes(1);
    expect(checkedChange).toHaveBeenCalledWith(true);
  });

  it('toggle', async () => {
    const pressedChange = vi.fn();
    await render(
      `<volt-toggle aria-label="T" (pressedChange)="pressedChange($event)">T</volt-toggle>`,
      {
        imports: [VoltToggle],
        componentProperties: { pressedChange },
      }
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(pressedChange).toHaveBeenCalledTimes(1);
    expect(pressedChange).toHaveBeenCalledWith(true);
  });

  it('tabs', async () => {
    const valueChange = vi.fn();
    await render(
      `<volt-tabs value="a" (valueChange)="valueChange($event)"><volt-tabs-list><volt-tabs-trigger value="a">A</volt-tabs-trigger><volt-tabs-trigger value="b">B</volt-tabs-trigger></volt-tabs-list><volt-tabs-content value="a">PA</volt-tabs-content><volt-tabs-content value="b">PB</volt-tabs-content></volt-tabs>`,
      {
        imports: [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent],
        componentProperties: { valueChange },
      }
    );
    await userEvent.setup().click(screen.getByRole('tab', { name: 'B' }));
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenCalledWith('b');
  });

  it('select', async () => {
    const valueChange = vi.fn();
    const user = userEvent.setup();
    await render(
      `<volt-select value="a" ariaLabel="S" (valueChange)="valueChange($event)"><volt-select-content><volt-select-item value="a">Alpha</volt-select-item><volt-select-item value="b">Beta</volt-select-item></volt-select-content></volt-select>`,
      {
        imports: [VoltSelect, VoltSelectContent, VoltSelectItem],
        componentProperties: { valueChange },
      }
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Beta' }));
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenCalledWith('b');
  });
});

describe('dynamic one-way binding stays coherent with user interaction', () => {
  it('radio-group: parent update reaches the DOM, then a click still moves the selection', async () => {
    const { fixture } = await render(
      `<volt-radio-group [value]="v()"><volt-radio-item value="a">A</volt-radio-item><volt-radio-item value="b">B</volt-radio-item><volt-radio-item value="c">C</volt-radio-item></volt-radio-group>`,
      { imports: [VoltRadioGroup, VoltRadioItem], componentProperties: { v: signal('a') } }
    );
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
    await set(fixture, 'v', 'b');
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'false');
    await userEvent.setup().click(screen.getByRole('radio', { name: 'C' }));
    expect(screen.getByRole('radio', { name: 'C' })).toHaveAttribute('aria-checked', 'true');
  });

  it('toggle-group', async () => {
    const { fixture } = await render(
      `<volt-toggle-group [value]="v()"><volt-toggle-group-item value="a">A</volt-toggle-group-item><volt-toggle-group-item value="b">B</volt-toggle-group-item></volt-toggle-group>`,
      { imports: [VoltToggleGroup, VoltToggleGroupItem], componentProperties: { v: signal(['a']) } }
    );
    await set(fixture, 'v', ['b']);
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'false');
    await userEvent.setup().click(screen.getByRole('radio', { name: 'A' }));
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
  });

  it('listbox', async () => {
    const { fixture } = await render(
      `<volt-listbox [value]="v()" aria-label="L"><volt-listbox-option value="a">A</volt-listbox-option><volt-listbox-option value="b">B</volt-listbox-option></volt-listbox>`,
      { imports: [VoltListbox, VoltListboxOption], componentProperties: { v: signal(['a']) } }
    );
    await set(fixture, 'v', ['b']);
    expect(screen.getByRole('option', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'A' })).toHaveAttribute('aria-selected', 'false');
    await userEvent.setup().click(screen.getByRole('option', { name: 'A' }));
    expect(screen.getByRole('option', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
  });

  it('slider', async () => {
    const { fixture } = await render(`<volt-slider [value]="v()" ariaLabel="S" />`, {
      imports: [VoltSlider],
      componentProperties: { v: signal(10) },
    });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '10');
    await set(fixture, 'v', 70);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '70');
    screen.getByRole('slider').focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '71');
  });

  it('checkbox', async () => {
    const { fixture } = await render(`<volt-checkbox [checked]="c()" aria-label="C" />`, {
      imports: [VoltCheckbox],
      componentProperties: { c: signal(false) },
    });
    await set(fixture, 'c', true);
    expect(screen.getByRole('checkbox')).toBeChecked();
    await userEvent.setup().click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('switch', async () => {
    const { fixture } = await render(`<volt-switch [checked]="c()" aria-label="S" />`, {
      imports: [VoltSwitch],
      componentProperties: { c: signal(false) },
    });
    await set(fixture, 'c', true);
    expect(screen.getByRole('switch')).toBeChecked();
    await userEvent.setup().click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('toggle', async () => {
    const { fixture } = await render(
      `<volt-toggle [pressed]="p()" aria-label="T">T</volt-toggle>`,
      {
        imports: [VoltToggle],
        componentProperties: { p: signal(false) },
      }
    );
    await set(fixture, 'p', true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('tabs', async () => {
    const { fixture } = await render(
      `<volt-tabs [value]="v()"><volt-tabs-list><volt-tabs-trigger value="a">A</volt-tabs-trigger><volt-tabs-trigger value="b">B</volt-tabs-trigger><volt-tabs-trigger value="c">C</volt-tabs-trigger></volt-tabs-list><volt-tabs-content value="a">PA</volt-tabs-content><volt-tabs-content value="b">PB</volt-tabs-content><volt-tabs-content value="c">PC</volt-tabs-content></volt-tabs>`,
      {
        imports: [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent],
        componentProperties: { v: signal('a') },
      }
    );
    await set(fixture, 'v', 'b');
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('PB')).toBeVisible();
    await userEvent.setup().click(screen.getByRole('tab', { name: 'C' }));
    expect(screen.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('PC')).toBeVisible();
  });

  it('accordion', async () => {
    const { fixture } = await render(
      `<volt-accordion [value]="v()"><volt-accordion-item value="a"><volt-accordion-trigger>A</volt-accordion-trigger><volt-accordion-content>CA</volt-accordion-content></volt-accordion-item><volt-accordion-item value="b"><volt-accordion-trigger>B</volt-accordion-trigger><volt-accordion-content>CB</volt-accordion-content></volt-accordion-item></volt-accordion>`,
      {
        imports: [VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent],
        componentProperties: { v: signal('a') },
      }
    );
    await set(fixture, 'v', 'b');
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-expanded', 'true');
    await userEvent.setup().click(screen.getByRole('button', { name: 'A' }));
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('static initial values on the remaining stateful components', () => {
  it('select: static value is shown, then another option can be chosen', async () => {
    const user = userEvent.setup();
    await render(
      `<volt-select value="a" ariaLabel="S"><volt-select-content><volt-select-item value="a">Alpha</volt-select-item><volt-select-item value="b">Beta</volt-select-item></volt-select-content></volt-select>`,
      { imports: [VoltSelect, VoltSelectContent, VoltSelectItem] }
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('a');
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Beta' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('b');
  });

  it('checkbox / switch: static checked can still be unchecked', async () => {
    await render(
      `<volt-checkbox [checked]="true" aria-label="C" /><volt-switch [checked]="true" aria-label="S" />`,
      {
        imports: [VoltCheckbox, VoltSwitch],
      }
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('range-slider: static low/high respond to the keyboard', async () => {
    const lowChange = vi.fn();
    const highChange = vi.fn();
    await render(
      `<volt-range-slider [low]="20" [high]="80" ariaLabelLow="Low" ariaLabelHigh="High" (lowChange)="lowChange($event)" (highChange)="highChange($event)" />`,
      { imports: [VoltRangeSlider], componentProperties: { lowChange, highChange } }
    );
    const [low, high] = screen.getAllByRole('slider');
    expect(low).toHaveAttribute('aria-valuenow', '20');
    expect(high).toHaveAttribute('aria-valuenow', '80');
    low.focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(low).toHaveAttribute('aria-valuenow', '21');
    expect(lowChange).toHaveBeenCalledTimes(1);
    expect(highChange).not.toHaveBeenCalled();
    high.focus();
    await userEvent.setup().keyboard('{ArrowLeft}');
    expect(high).toHaveAttribute('aria-valuenow', '79');
    expect(highChange).toHaveBeenCalledTimes(1);
  });
});

describe('a programmatic write is not a user change', () => {
  it('radio-group, toggle-group, listbox, slider do not emit on a parent update', async () => {
    const radio = vi.fn();
    const group = vi.fn();
    const list = vi.fn();
    const slider = vi.fn();
    const { fixture } = await render(
      `<volt-radio-group [value]="r()" (valueChange)="radio($event)"><volt-radio-item value="a">A</volt-radio-item><volt-radio-item value="b">B</volt-radio-item></volt-radio-group>
       <volt-toggle-group [value]="g()" (valueChange)="group($event)"><volt-toggle-group-item value="a">TA</volt-toggle-group-item><volt-toggle-group-item value="b">TB</volt-toggle-group-item></volt-toggle-group>
       <volt-listbox [value]="l()" aria-label="L" (valueChange)="list($event)"><volt-listbox-option value="a">LA</volt-listbox-option><volt-listbox-option value="b">LB</volt-listbox-option></volt-listbox>
       <volt-slider [value]="s()" ariaLabel="S" (valueChange)="slider($event)" />`,
      {
        imports: [
          VoltRadioGroup,
          VoltRadioItem,
          VoltToggleGroup,
          VoltToggleGroupItem,
          VoltListbox,
          VoltListboxOption,
          VoltSlider,
        ],
        componentProperties: {
          r: signal('a'),
          g: signal(['a']),
          l: signal(['a']),
          s: signal(10),
          radio,
          group,
          list,
          slider,
        },
      }
    );
    await set(fixture, 'r', 'b');
    await set(fixture, 'g', ['b']);
    await set(fixture, 'l', ['b']);
    await set(fixture, 's', 60);
    expect(radio).not.toHaveBeenCalled();
    expect(group).not.toHaveBeenCalled();
    expect(list).not.toHaveBeenCalled();
    expect(slider).not.toHaveBeenCalled();
  });
});

describe('combobox and date-picker', () => {
  it('combobox: a static value is shown, one pick emits once and replaces it', async () => {
    const valueChange = vi.fn();
    const user = userEvent.setup();
    await render(
      `<volt-combobox value="Angular" [items]="items" label="Framework" (valueChange)="valueChange($event)"><ng-template let-item>{{ item }}</ng-template></volt-combobox>`,
      {
        imports: [VoltCombobox],
        componentProperties: { items: ['Angular', 'React', 'Vue'], valueChange },
      }
    );
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Angular');
    await user.click(input);
    await user.click(await screen.findByRole('option', { name: 'React' }));
    expect(input).toHaveValue('React');
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenCalledWith('React');
  });

  it('date-picker: a static date can be replaced by clicking another day, emitting once', async () => {
    const dateChange = vi.fn();
    const user = userEvent.setup();
    await render(
      `<volt-date-picker [date]="date" [focusedDate]="date" (dateChange)="dateChange($event)" aria-label="Date">
         <volt-date-picker-grid>
           <div *ngpDatePickerRowRender>
             <volt-date-picker-cell *ngpDatePickerCellRender="let day">
               <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
             </volt-date-picker-cell>
           </div>
         </volt-date-picker-grid>
       </volt-date-picker>`,
      {
        imports: [
          VoltDatePicker,
          VoltDatePickerGrid,
          VoltDatePickerCell,
          VoltDatePickerDateButton,
          NgpDatePickerRowRender,
          NgpDatePickerCellRender,
        ],
        componentProperties: { date: new Date(2026, 6, 29), dateChange },
      }
    );
    const day = (n: string) =>
      screen
        .getAllByText(n, { selector: 'volt-date-picker-date-button' })
        .filter(el => !el.hasAttribute('data-outside-month'))[0];
    expect(day('29')).toHaveAttribute('data-selected');
    await user.click(day('4'));
    expect(day('4')).toHaveAttribute('data-selected');
    expect(day('29')).not.toHaveAttribute('data-selected');
    expect(dateChange).toHaveBeenCalledTimes(1);
  });
});

describe('date-picker two-way and range', () => {
  const grid = `<volt-date-picker-grid>
      <div *ngpDatePickerRowRender>
        <volt-date-picker-cell *ngpDatePickerCellRender="let day">
          <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
        </volt-date-picker-cell>
      </div>
    </volt-date-picker-grid>`;
  const imports = [
    VoltDatePicker,
    VoltDateRangePicker,
    VoltDatePickerGrid,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    NgpDatePickerRowRender,
    NgpDatePickerCellRender,
  ];
  const day = (n: string) =>
    screen
      .getAllByText(n, { selector: 'volt-date-picker-date-button' })
      .filter(el => !el.hasAttribute('data-outside-month'))[0];

  it('[(date)] receives the clicked day and a parent update moves the selection', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(
      `<volt-date-picker [(date)]="date" [focusedDate]="date()" aria-label="Date">${grid}</volt-date-picker>`,
      { imports, componentProperties: { date: signal<Date | undefined>(new Date(2026, 6, 29)) } }
    );
    const host = fixture.componentInstance as unknown as { date: WritableSignal<Date | undefined> };
    await user.click(day('4'));
    expect(host.date()).toEqual(new Date(2026, 6, 4));
    host.date.set(new Date(2026, 6, 10));
    await fixture.whenStable();
    expect(day('10')).toHaveAttribute('data-selected');
    expect(day('4')).not.toHaveAttribute('data-selected');
  });

  it('range-picker: a static start/end stays interactive', async () => {
    const user = userEvent.setup();
    await render(
      `<volt-date-range-picker [startDate]="start" [endDate]="end" [focusedDate]="start" aria-label="Range">${grid}</volt-date-range-picker>`,
      {
        imports,
        componentProperties: { start: new Date(2026, 6, 10), end: new Date(2026, 6, 15) },
      }
    );
    expect(day('10')).toHaveAttribute('data-selected');
    expect(day('15')).toHaveAttribute('data-selected');
    await user.click(day('20'));
    await user.click(day('25'));
    expect(day('20')).toHaveAttribute('data-selected');
    expect(day('25')).toHaveAttribute('data-selected');
    expect(day('10')).not.toHaveAttribute('data-selected');
  });
});

describe('navigation-menu', () => {
  it('a static value opens that menu, and another trigger can still take over', async () => {
    const user = userEvent.setup();
    await render(
      `<volt-navigation-menu value="a" aria-label="Main"><volt-navigation-menu-list>
         <volt-navigation-menu-item value="a"><volt-navigation-menu-trigger [content]="a">Alpha</volt-navigation-menu-trigger></volt-navigation-menu-item>
         <volt-navigation-menu-item value="b"><volt-navigation-menu-trigger [content]="b">Beta</volt-navigation-menu-trigger></volt-navigation-menu-item>
       </volt-navigation-menu-list></volt-navigation-menu>
       <ng-template #a><volt-navigation-menu-content><volt-navigation-menu-content-item><a href="/a">Link A</a></volt-navigation-menu-content-item></volt-navigation-menu-content></ng-template>
       <ng-template #b><volt-navigation-menu-content><volt-navigation-menu-content-item><a href="/b">Link B</a></volt-navigation-menu-content-item></volt-navigation-menu-content></ng-template>`,
      {
        imports: [
          VoltNavigationMenu,
          VoltNavigationMenuList,
          VoltNavigationMenuItem,
          VoltNavigationMenuTrigger,
          VoltNavigationMenuContent,
          VoltNavigationMenuContentItem,
        ],
      }
    );
    await user.click(screen.getByRole('button', { name: 'Beta' }));
    expect(await screen.findByText('Link B')).toBeVisible();
  });
});
