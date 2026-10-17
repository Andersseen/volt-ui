import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  NgpDatePickerCellRender,
  NgpDatePickerRowRender,
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
  VoltDatePickerLabel,
  VoltDatePickerNextMonth,
  VoltDatePickerPreviousMonth,
  VoltDialog,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogTitle,
  VoltDrawer,
  VoltDrawerContent,
  VoltDrawerDescription,
  VoltDrawerOverlay,
  VoltDrawerTitle,
  VoltDropdownMenu,
  VoltDropdownMenuItem,
  VoltDropdownMenuTrigger,
  VoltFileDropzone,
  VoltFileUpload,
  VoltInputOtp,
  VoltListbox,
  VoltListboxOption,
  VoltNativeButton,
  VoltPopoverContent,
  VoltPopoverTrigger,
  VoltRadioGroup,
  VoltRadioItem,
  VoltRangeSlider,
  VoltResizable,
  VoltResizableHandle,
  VoltResizablePanel,
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
  VoltToolbar,
  VoltToolbarButton,
  VoltTooltip,
  VoltTooltipContent,
} from '@voltui/components';

/**
 * The 1.3.0 regression class: a component given a *static* initial value (no `[(…)]`, no form
 * control) rendered the right state and then froze on the first interaction. jsdom specs only
 * exercised the two-way and forms paths, which hide it. Every stateful component that takes a
 * value is here with a literal one.
 */
@Component({
  selector: 'app-static-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltRadioGroup,
    VoltRadioItem,
    VoltToggleGroup,
    VoltToggleGroupItem,
    VoltSlider,
    VoltRangeSlider,
    VoltListbox,
    VoltListboxOption,
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltCombobox,
    VoltCheckbox,
    VoltSwitch,
    VoltToggle,
  ],
  template: `
    <volt-radio-group value="a" aria-label="Radio">
      <volt-radio-item value="a">Radio A</volt-radio-item>
      <volt-radio-item value="b">Radio B</volt-radio-item>
    </volt-radio-group>

    <volt-toggle-group [value]="['a']" aria-label="Group">
      <volt-toggle-group-item value="a">TG A</volt-toggle-group-item>
      <volt-toggle-group-item value="b">TG B</volt-toggle-group-item>
    </volt-toggle-group>

    <volt-slider [value]="40" ariaLabel="Slider" />
    <volt-range-slider [low]="20" [high]="80" ariaLabelLow="Low" ariaLabelHigh="High" />

    <volt-listbox [value]="['a']" aria-label="Listbox">
      <volt-listbox-option value="a">LB A</volt-listbox-option>
      <volt-listbox-option value="b">LB B</volt-listbox-option>
    </volt-listbox>

    <volt-tabs value="a">
      <volt-tabs-list>
        <volt-tabs-trigger value="a">Tab A</volt-tabs-trigger>
        <volt-tabs-trigger value="b">Tab B</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="a">Panel A</volt-tabs-content>
      <volt-tabs-content value="b">Panel B</volt-tabs-content>
    </volt-tabs>

    <volt-accordion value="a">
      <volt-accordion-item value="a">
        <volt-accordion-trigger>Acc A</volt-accordion-trigger>
        <volt-accordion-content>Acc content A</volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="b">
        <volt-accordion-trigger>Acc B</volt-accordion-trigger>
        <volt-accordion-content>Acc content B</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>

    <volt-select value="a" ariaLabel="Select">
      <volt-select-content>
        <volt-select-item value="a">Sel A</volt-select-item>
        <volt-select-item value="b">Sel B</volt-select-item>
      </volt-select-content>
    </volt-select>

    <volt-combobox value="Angular" [items]="frameworks" label="Framework">
      <ng-template let-item>{{ item }}</ng-template>
    </volt-combobox>

    <volt-checkbox [checked]="true" aria-label="Checkbox" />
    <volt-switch [checked]="true" aria-label="Switch" />
    <volt-toggle [pressed]="true" aria-label="Toggle">Toggle</volt-toggle>
  `,
})
export class StaticValueFixture {
  protected readonly frameworks = ['Angular', 'React', 'Vue'];
}

@Component({
  selector: 'app-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltRadioGroup, VoltRadioItem, VoltNativeButton],
  template: `
    <button voltButton variant="outline" id="before">Before</button>
    <volt-radio-group value="b" aria-label="Plan">
      <volt-radio-item value="a">Free</volt-radio-item>
      <volt-radio-item value="b">Pro</volt-radio-item>
      <volt-radio-item value="c">Team</volt-radio-item>
    </volt-radio-group>
    <button voltButton variant="outline" id="after">After</button>
  `,
})
export class RadioFixture {}

@Component({
  selector: 'app-toggle-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltToggleGroup, VoltToggleGroupItem, VoltToolbar, VoltToolbarButton],
  template: `
    <volt-toggle-group [value]="['b']" aria-label="Align">
      <volt-toggle-group-item value="l">Left</volt-toggle-group-item>
      <volt-toggle-group-item value="b">Centre</volt-toggle-group-item>
      <volt-toggle-group-item value="r">Right</volt-toggle-group-item>
    </volt-toggle-group>

    <volt-toolbar aria-label="Formatting" class="mt-6">
      <button
        voltToolbarButton
        type="button"
        [attr.aria-pressed]="bold()"
        (click)="bold.set(!bold())"
      >
        Bold
      </button>
      <button voltToolbarButton type="button">Italic</button>
      <button voltToolbarButton type="button">Save</button>
    </volt-toolbar>
  `,
})
export class ToggleGroupToolbarFixture {
  protected readonly bold = signal(false);
}

@Component({
  selector: 'app-tabs-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
  ],
  template: `
    <volt-tabs value="one">
      <volt-tabs-list>
        <volt-tabs-trigger value="one">One</volt-tabs-trigger>
        <volt-tabs-trigger value="two">Two</volt-tabs-trigger>
        <volt-tabs-trigger value="three">Three</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="one">Panel one</volt-tabs-content>
      <volt-tabs-content value="two">Panel two</volt-tabs-content>
      <volt-tabs-content value="three">Panel three</volt-tabs-content>
    </volt-tabs>

    <volt-accordion class="mt-8">
      <volt-accordion-item value="q1">
        <volt-accordion-trigger>Question one</volt-accordion-trigger>
        <volt-accordion-content>Answer one</volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="q2">
        <volt-accordion-trigger>Question two</volt-accordion-trigger>
        <volt-accordion-content>Answer two</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>
  `,
})
export class TabsAccordionFixture {}

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem],
  template: `
    <volt-select value="apple" ariaLabel="Fruit" (valueChange)="log.push($event)">
      <volt-select-content>
        <volt-select-item value="apple">Apple</volt-select-item>
        <volt-select-item value="banana">Banana</volt-select-item>
        <volt-select-item value="carrot">Carrot</volt-select-item>
      </volt-select-content>
    </volt-select>
    <p id="log">{{ log.join(',') }}</p>
  `,
})
export class SelectFixture {
  protected readonly log: unknown[] = [];
}

@Component({
  selector: 'app-listbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltListbox, VoltListboxOption],
  template: `
    <volt-listbox [value]="['angular']" aria-label="Framework">
      <volt-listbox-option value="angular">Angular</volt-listbox-option>
      <volt-listbox-option value="react">React</volt-listbox-option>
      <volt-listbox-option value="vue">Vue</volt-listbox-option>
    </volt-listbox>
  `,
})
export class ListboxFixture {}

interface Person {
  id: number;
  name: string;
}

@Component({
  selector: 'app-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, VoltCombobox],
  template: `
    <volt-combobox label="Local" [formControl]="local" [items]="frameworks">
      <ng-template let-item>{{ item }}</ng-template>
    </volt-combobox>
    <p id="local-value">{{ local.value ?? 'none' }}</p>

    <volt-combobox
      class="mt-8 block"
      label="Remote"
      filterMode="manual"
      [formControl]="owner"
      [items]="results()"
      [loading]="loading()"
      loadingText="Searching…"
      [itemLabel]="personLabel"
      [compareWith]="samePerson"
      [trackByFn]="personId"
      (queryChange)="search($event)"
    />
    <p id="remote-value">{{ owner.value?.name ?? 'none' }}</p>
    <p id="remote-queries">{{ queries.join('|') }}</p>
  `,
})
export class ComboboxFixtures {
  protected readonly frameworks = ['Angular', 'React', 'Vue', 'Svelte'];
  protected readonly local = new FormControl<string | null>(null);

  private readonly people: Person[] = [
    { id: 1, name: 'Alan Turing' },
    { id: 2, name: 'Grace Hopper' },
    { id: 3, name: 'Ada Lovelace' },
  ];
  protected readonly owner = new FormControl<Person | null>(null);
  protected readonly results = signal<Person[]>([]);
  protected readonly loading = signal(false);
  protected readonly queries: string[] = [];

  protected readonly personLabel = (person: unknown) => (person as Person).name;
  protected readonly samePerson = (a: unknown, b: unknown) =>
    (a as Person | null)?.id === (b as Person | null)?.id;
  protected readonly personId = (_index: number, person: unknown) => (person as Person).id;

  private latest = 0;

  /** A server that answers late and ignores the casing: Volt must show exactly what it returns. */
  protected search(query: string): void {
    this.queries.push(query);
    const mine = ++this.latest;
    this.loading.set(true);
    setTimeout(() => {
      if (mine !== this.latest) return;
      // Deliberately not a substring of the label: proves Volt does not filter a manual list again.
      this.results.set(query ? this.people.filter(p => p.id % 2 === 1) : []);
      this.loading.set(false);
    }, 150);
  }
}

@Component({
  selector: 'app-sliders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltSlider, VoltRangeSlider],
  template: `
    <div class="w-80">
      <volt-slider [value]="50" ariaLabel="Volume" (valueChange)="volume.set($event)" />
      <p id="volume">{{ volume() }}</p>

      <volt-slider class="mt-6" [value]="30" [disabled]="true" ariaLabel="Locked" />

      <volt-range-slider
        class="mt-6"
        [low]="20"
        [high]="80"
        ariaLabelLow="Minimum"
        ariaLabelHigh="Maximum"
        (lowChange)="low.set($event)"
        (highChange)="high.set($event)"
      />
      <p id="range">{{ low() }}-{{ high() }}</p>
    </div>
  `,
})
export class SliderFixtures {
  protected readonly volume = signal(50);
  protected readonly low = signal(20);
  protected readonly high = signal(80);
}

@Component({
  selector: 'app-resizable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltResizable, VoltResizablePanel, VoltResizableHandle],
  template: `
    <volt-resizable orientation="horizontal" class="h-40 w-[600px] rounded-lg border border-border">
      <volt-resizable-panel id="left" class="p-4">Left</volt-resizable-panel>
      <volt-resizable-handle />
      <volt-resizable-panel id="right" class="p-4">Right</volt-resizable-panel>
    </volt-resizable>
  `,
})
export class ResizableFixture {}

@Component({
  selector: 'app-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, VoltInputOtp],
  template: `
    <volt-input-otp [formControl]="code" [length]="6" />
    <p id="otp-value">{{ code.value }}</p>
    <p id="otp-complete">{{ code.value.length === 6 ? 'complete' : 'incomplete' }}</p>
  `,
})
export class InputOtpFixture {
  protected readonly code = new FormControl('', { nonNullable: true });
}

@Component({
  selector: 'app-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltFileDropzone, VoltFileUpload, VoltNativeButton],
  template: `
    <volt-file-dropzone multiple (selected)="onSelected($event)"
      >Drop files here</volt-file-dropzone
    >
    <button voltButton voltFileUpload multiple class="mt-3" (selected)="onSelected($event)">
      Browse files
    </button>
    <p id="files">{{ names().join(',') || 'none' }}</p>
  `,
})
export class FileUploadFixture {
  protected readonly names = signal<string[]>([]);

  protected onSelected(files: File[] | FileList | null): void {
    this.names.set(Array.from(files ?? []).map(f => f.name));
  }
}

@Component({
  selector: 'app-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      [date]="initial"
      [(focusedDate)]="focusedDate"
      [dateDisabled]="isDisabled"
      (dateChange)="selected.set($event)"
      aria-label="Appointment"
    >
      <div class="flex items-center justify-between">
        <volt-date-picker-previous-month aria-label="Previous month"
          >‹</volt-date-picker-previous-month
        >
        <volt-date-picker-label>{{ label() }}</volt-date-picker-label>
        <volt-date-picker-next-month aria-label="Next month">›</volt-date-picker-next-month>
      </div>
      <volt-date-picker-grid>
        <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
          <volt-date-picker-cell *ngpDatePickerCellRender="let day">
            <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
          </volt-date-picker-cell>
        </div>
      </volt-date-picker-grid>
    </volt-date-picker>
    <p id="picked">{{ selected()?.toDateString() ?? 'none' }}</p>
  `,
})
export class DatePickerFixture {
  protected readonly initial = new Date(2026, 6, 15);
  protected readonly focusedDate = signal(new Date(2026, 6, 15));
  protected readonly selected = signal<Date | undefined>(undefined);
  protected readonly label = computed(() =>
    this.focusedDate().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  );
  /** The 20th is unavailable. */
  protected readonly isDisabled = (date: Date): boolean =>
    date.getFullYear() === 2026 && date.getMonth() === 6 && date.getDate() === 20;
}

@Component({
  selector: 'app-overlays',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltNativeButton,
    VoltDialog,
    VoltDialogOverlay,
    VoltDialogContent,
    VoltDialogTitle,
    VoltDialogDescription,
    VoltDrawer,
    VoltDrawerOverlay,
    VoltDrawerContent,
    VoltDrawerTitle,
    VoltDrawerDescription,
    VoltPopoverTrigger,
    VoltPopoverContent,
    VoltTooltip,
    VoltTooltipContent,
    VoltDropdownMenu,
    VoltDropdownMenuItem,
    VoltDropdownMenuTrigger,
  ],
  template: `
    <div class="flex flex-wrap gap-3">
      <button voltButton [voltDialog]="dialogTpl">Open dialog</button>
      <button voltButton variant="outline" [voltDrawer]="drawerTpl">Open drawer</button>
      <button voltButton variant="outline" [voltPopover]="popoverTpl">Open popover</button>
      <button voltButton variant="ghost" [voltTooltip]="tooltipTpl">Hover for tip</button>
      <button voltButton variant="outline" [voltDropdownMenu]="menuTpl">Open menu</button>
    </div>

    <ng-template #dialogTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Dialog title</h2>
        <p voltDialogDescription>Dialog description</p>
        <button voltButton id="dialog-first">First action</button>
        <button voltButton variant="outline" (click)="close()">Close dialog</button>
      </div>
    </ng-template>

    <ng-template #drawerTpl let-close="close">
      <div voltDrawerOverlay></div>
      <div voltDrawerContent side="right">
        <h2 voltDrawerTitle>Drawer title</h2>
        <p voltDrawerDescription>Drawer description</p>
        <button voltButton variant="outline" (click)="close()">Close drawer</button>
      </div>
    </ng-template>

    <ng-template #popoverTpl>
      <volt-popover-content>
        <button voltButton size="sm" id="popover-action">Popover action</button>
      </volt-popover-content>
    </ng-template>

    <ng-template #tooltipTpl>
      <volt-tooltip-content>Helpful tip</volt-tooltip-content>
    </ng-template>

    <ng-template #menuTpl>
      <volt-dropdown-menu>
        <volt-dropdown-menu-item (click)="picked.set('profile')">Profile</volt-dropdown-menu-item>
        <volt-dropdown-menu-item (click)="picked.set('settings')">Settings</volt-dropdown-menu-item>
      </volt-dropdown-menu>
    </ng-template>
    <p id="menu-picked">{{ picked() }}</p>
  `,
})
export class OverlayFixtures {
  protected readonly picked = signal('none');
}

/**
 * Selected/pressed/checked must be *visible*, not only announced: a 1.3.1 Toggle reported
 * aria-pressed correctly while looking identical in both states.
 */
@Component({
  selector: 'app-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltToggle,
    VoltToggleGroup,
    VoltToggleGroupItem,
    VoltCheckbox,
    VoltSwitch,
    VoltRadioGroup,
    VoltRadioItem,
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltListbox,
    VoltListboxOption,
  ],
  template: `
    <div class="flex flex-col gap-4">
      <volt-toggle aria-label="Toggle on" [pressed]="true">On</volt-toggle>
      <volt-toggle aria-label="Toggle off">Off</volt-toggle>

      <volt-toggle-group [value]="['a']" aria-label="Group">
        <volt-toggle-group-item value="a">Pressed</volt-toggle-group-item>
        <volt-toggle-group-item value="b">Unpressed</volt-toggle-group-item>
      </volt-toggle-group>

      <volt-checkbox [checked]="true" aria-label="Checked box" />
      <volt-checkbox aria-label="Unchecked box" />

      <volt-switch [checked]="true" aria-label="Switch on" />
      <volt-switch aria-label="Switch off" />

      <volt-radio-group value="a" aria-label="Radio">
        <volt-radio-item value="a">Radio on</volt-radio-item>
        <volt-radio-item value="b">Radio off</volt-radio-item>
      </volt-radio-group>

      <volt-tabs value="a">
        <volt-tabs-list>
          <volt-tabs-trigger value="a">Tab selected</volt-tabs-trigger>
          <volt-tabs-trigger value="b">Tab other</volt-tabs-trigger>
        </volt-tabs-list>
        <volt-tabs-content value="a">A</volt-tabs-content>
        <volt-tabs-content value="b">B</volt-tabs-content>
      </volt-tabs>

      <volt-listbox [value]="['a']" aria-label="Listbox">
        <volt-listbox-option value="a">Option selected</volt-listbox-option>
        <volt-listbox-option value="b">Option other</volt-listbox-option>
      </volt-listbox>
    </div>
  `,
})
export class VisualStateFixture {}
