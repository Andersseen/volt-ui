import { ApplicationRef, Component, inject, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpDatePickerCellRender, NgpDatePickerRowRender } from 'ng-primitives/date-picker';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  provideVoltToast,
  VoltDatePicker,
  VoltDatePickerCell,
  VoltDatePickerDateButton,
  VoltDatePickerGrid,
  VoltFileDropzone,
  VoltNavigationMenu,
  VoltNavigationMenuContent,
  VoltNavigationMenuContentItem,
  VoltNavigationMenuItem,
  VoltNavigationMenuList,
  VoltNavigationMenuTrigger,
  VoltInput,
  VoltSearch,
  VoltSearchClear,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltTextarea,
  VoltToastService,
  VoltToolbar,
  VoltToolbarButton,
  VoltTooltip,
  VoltTooltipContent,
} from '../public-api';

/** Third batch of the interaction contracts — see interaction-contract.spec.ts. */
async function set<T>(fixture: ComponentFixture<unknown>, name: string, value: T): Promise<void> {
  (fixture.componentInstance as Record<string, WritableSignal<T>>)[name].set(value);
  await fixture.whenStable();
}

describe('select', () => {
  const tpl = (attrs: string) =>
    `<volt-select ariaLabel="Fruit" ${attrs}><volt-select-content><volt-select-item value="a">Apple</volt-select-item><volt-select-item value="b">Banana</volt-select-item></volt-select-content></volt-select>`;
  const imports = [VoltSelect, VoltSelectContent, VoltSelectItem];

  it('select: a dynamic [value] reaches the trigger, and a choice still works afterwards', async () => {
    const { fixture } = await render(tpl('[displayWith]="show" [value]="v()"'), {
      imports,
      componentProperties: { v: signal('a'), show: (x: unknown) => String(x).toUpperCase() },
    });
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('A');
    await set(fixture, 'v', 'b');
    expect(trigger).toHaveTextContent('B');
    const user = userEvent.setup();
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Apple' }));
    expect(trigger).toHaveTextContent('A');
  });

  it('select: [(value)] follows the parent and reports a choice', async () => {
    const { fixture } = await render(tpl('[(value)]="v"'), {
      imports,
      componentProperties: { v: signal<string | undefined>('a') },
    });
    const host = fixture.componentInstance as { v: WritableSignal<string | undefined> };
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Banana' }));
    expect(host.v()).toBe('b');
    await set(fixture, 'v', 'a');
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Apple' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});

describe('textarea and native-select naming', () => {
  it('textarea: aria-label names the native textarea, and the host carries none', async () => {
    const { container } = await render(`<volt-textarea aria-label="Message" />`, {
      imports: [VoltTextarea],
    });
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeInTheDocument();
    expect(container.querySelector('volt-textarea')).not.toHaveAttribute('aria-label');
  });
});

describe('search', () => {
  const tpl = `<volt-search><volt-input type="search" aria-label="Find" /><volt-search-clear aria-label="Clear search" /></volt-search>`;

  it('search: the clear button is named and clears the field with a click', async () => {
    await render(tpl, { imports: [VoltInput, VoltSearch, VoltSearchClear] });
    const user = userEvent.setup();
    const input = screen.getByRole('searchbox', { name: 'Find' });
    await user.type(input, 'volt');
    expect(input).toHaveValue('volt');
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input).toHaveValue('');
  });

  it('search: the clear button is operable from the keyboard', async () => {
    await render(tpl, { imports: [VoltInput, VoltSearch, VoltSearchClear] });
    const user = userEvent.setup();
    const input = screen.getByRole('searchbox', { name: 'Find' });
    await user.type(input, 'volt');
    screen.getByRole('button', { name: 'Clear search' }).focus();
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('');
  });
});

describe('toolbar', () => {
  it('toolbar: is named by aria-label, exposes its role and orientation, and a button reports its pressed state (aria-pressed)', async () => {
    await render(
      `<volt-toolbar aria-label="Formatting"><button voltToolbarButton type="button" [attr.aria-pressed]="bold()" (click)="bold.set(!bold())">Bold</button><button voltToolbarButton type="button">Save</button></volt-toolbar>`,
      { imports: [VoltToolbar, VoltToolbarButton], componentProperties: { bold: signal(false) } }
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Bold' }));
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('tooltip', () => {
  it('tooltip: opens on hover and closes when the pointer leaves', async () => {
    await render(
      `<button type="button" [voltTooltip]="tip" [delay]="0" [closeDelay]="0">Trigger</button><ng-template #tip><volt-tooltip-content>Tip body</volt-tooltip-content></ng-template>`,
      { imports: [VoltTooltip, VoltTooltipContent] }
    );
    const user = userEvent.setup();
    await user.hover(screen.getByRole('button', { name: 'Trigger' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Tip body');
    await user.unhover(screen.getByRole('button', { name: 'Trigger' }));
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('tooltip: Escape closes it while keyboard focus stays on the trigger', async () => {
    await render(
      `<button type="button" [voltTooltip]="tip" [delay]="0" [closeDelay]="0">Trigger</button><ng-template #tip><volt-tooltip-content>Tip body</volt-tooltip-content></ng-template>`,
      { imports: [VoltTooltip, VoltTooltipContent] }
    );
    const user = userEvent.setup();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus();
  });
});

describe('toast', () => {
  @Component({
    template: `<button (click)="toast.success('Saved')">Save</button>`,
  })
  class ToastHost {
    protected readonly toast = inject(VoltToastService);
  }

  afterEach(async () => {
    await TestBed.inject(VoltToastService).dismissAll();
    document.querySelectorAll('[data-ngp-toast-container]').forEach(el => el.remove());
  });

  it('toast: clicking its close button dismisses it', async () => {
    const result = await render(ToastHost, { providers: [provideVoltToast({ duration: 60_000 })] });
    TestBed.inject(ApplicationRef).components.push(result.fixture.componentRef);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByText('Saved')).toBeNull());
  });
});

describe('date-picker template-driven forms', () => {
  it('date-picker: works with ngModel — the date is shown and a clicked day is written back', async () => {
    const { fixture } = await render(
      `<volt-date-picker [(ngModel)]="d" aria-label="Date">
         <volt-date-picker-grid><div *ngpDatePickerRowRender><volt-date-picker-cell *ngpDatePickerCellRender="let day"><volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button></volt-date-picker-cell></div></volt-date-picker-grid>
       </volt-date-picker>`,
      {
        imports: [
          FormsModule,
          VoltDatePicker,
          VoltDatePickerGrid,
          VoltDatePickerCell,
          VoltDatePickerDateButton,
          NgpDatePickerRowRender,
          NgpDatePickerCellRender,
        ],
        componentProperties: { d: new Date(2026, 6, 15) },
      }
    );
    await fixture.whenStable();
    const day = (n: string) =>
      screen
        .getAllByText(n, { selector: 'volt-date-picker-date-button' })
        .filter(el => !el.hasAttribute('data-outside-month'))[0];
    expect(day('15')).toHaveAttribute('data-selected');
    await userEvent.setup().click(day('6'));
    expect((fixture.componentInstance as { d: Date }).d).toEqual(new Date(2026, 6, 6));
  });
});

describe('navigation-menu pointer', () => {
  it('navigation-menu: hovering a trigger opens its content with the pointer', async () => {
    await render(
      `<volt-navigation-menu aria-label="Main"><volt-navigation-menu-list>
         <volt-navigation-menu-item value="a"><volt-navigation-menu-trigger [content]="a">Alpha</volt-navigation-menu-trigger></volt-navigation-menu-item>
       </volt-navigation-menu-list></volt-navigation-menu>
       <ng-template #a><volt-navigation-menu-content><volt-navigation-menu-content-item><a href="/a">Link A</a></volt-navigation-menu-content-item></volt-navigation-menu-content></ng-template>`,
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
    const trigger = screen.getByRole('button', { name: 'Alpha' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.setup().hover(trigger);
    expect(await screen.findByText('Link A', undefined, { timeout: 3000 })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('file upload disabled', () => {
  it('file-upload: a disabled dropzone ignores a drop', async () => {
    const selected = vi.fn();
    const { container } = await render(
      `<volt-file-dropzone [disabled]="true" (selected)="selected($event)">Drop</volt-file-dropzone>`,
      { imports: [VoltFileDropzone], componentProperties: { selected } }
    );
    const zone = container.querySelector('volt-file-dropzone')!;
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });
    fireEvent.dragEnter(zone, { dataTransfer: { files: [file], types: ['Files'], items: [] } });
    fireEvent.drop(zone, { dataTransfer: { files: [file], types: ['Files'], items: [] } });
    expect(selected).not.toHaveBeenCalled();
    expect(zone).toHaveAttribute('data-disabled');
  });
});

void FormControl;
void ReactiveFormsModule;
