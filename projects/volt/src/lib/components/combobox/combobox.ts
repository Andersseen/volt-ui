import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  forwardRef,
  input,
  model,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpCombobox, NgpComboboxPortal, type NgpComboboxPlacement } from 'ng-primitives/combobox';
import { VoltComboboxInput } from './combobox-input';
import { VoltComboboxButton } from './combobox-button';
import { VoltComboboxDropdown } from './combobox-dropdown';
import { VoltComboboxOption } from './combobox-option';

let nextComboboxId = 0;

@Component({
  selector: 'volt-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgpCombobox,
    VoltComboboxInput,
    VoltComboboxButton,
    VoltComboboxDropdown,
    VoltComboboxOption,
    NgTemplateOutlet,
    NgpComboboxPortal,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltCombobox),
      multi: true,
    },
  ],
  host: {
    class: 'block w-full',
  },
  template: `
    <div
      #combobox="ngpCombobox"
      ngpCombobox
      [ngpComboboxValue]="value()"
      [ngpComboboxMultiple]="multiple()"
      [ngpComboboxDisabled]="isDisabled()"
      [ngpComboboxAllowDeselect]="allowDeselect()"
      [ngpComboboxCompareWith]="compareWith()"
      [ngpComboboxDropdownPlacement]="dropdownPlacement()"
      (ngpComboboxValueChange)="onValueChange($event)"
      (ngpComboboxOpenChange)="onOpenChange($event)"
      class="relative inline-flex w-full items-center gap-1"
    >
      <input
        #inputRef
        voltComboboxInput
        [id]="id()"
        [placeholder]="placeholder()"
        [attr.aria-label]="label()"
        (focus)="onInputFocus(combobox)"
        (input)="onFilterChange($event, combobox)"
        (blur)="onTouched()"
      />
      <volt-combobox-button aria-label="Toggle dropdown">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </volt-combobox-button>

      <ng-template ngpComboboxPortal>
        <volt-combobox-dropdown>
          @for (item of filteredItems(); track trackByFn()($index, item)) {
            <volt-combobox-option [value]="item" [index]="$index">
              <ng-container
                *ngTemplateOutlet="
                  optionTemplate() || defaultTemplate;
                  context: { $implicit: item }
                "
              />
            </volt-combobox-option>
          } @empty {
            <div class="px-2 py-1.5 text-sm text-muted-foreground">No results found.</div>
          }
        </volt-combobox-dropdown>
      </ng-template>
    </div>

    <ng-template #defaultTemplate let-item>{{ item }}</ng-template>
  `,
})
export class VoltCombobox implements ControlValueAccessor {
  readonly id = input(`volt-combobox-${++nextComboboxId}`);
  readonly label = input<string>();
  readonly value = model<unknown>();
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly allowDeselect = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly compareWith = input<(a: unknown, b: unknown) => boolean>(Object.is);
  readonly dropdownPlacement = input<NgpComboboxPlacement>('bottom');

  readonly items = input<unknown[]>([]);
  readonly placeholder = input<string>('Select...');
  readonly itemLabel = input<(item: unknown) => string>(item =>
    typeof item === 'string' ? item : String(item)
  );
  readonly trackByFn = input<(index: number, item: unknown) => unknown>((_i, item) => item);
  readonly optionTemplate = contentChild<TemplateRef<unknown>>(TemplateRef);

  private readonly inputRef = viewChild('inputRef', { read: ElementRef<HTMLInputElement> });

  protected readonly filteredItems = computed(() => {
    const filter = this.filter().trim().toLowerCase();

    if (!filter) {
      return this.items();
    }

    return this.items().filter(item => this.itemLabel()(item).toLowerCase().includes(filter));
  });
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  protected readonly filter = signal('');
  private readonly controlDisabled = signal(false);
  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const value = this.value();
      const label = value === undefined || value === null ? '' : this.itemLabel()(value);
      this.filter.set(label);

      const input = this.inputRef();
      if (input) {
        input.nativeElement.value = label;
      }
    });
  }

  protected onInputFocus(combobox: NgpCombobox): void {
    void combobox.openDropdown();
  }

  protected onFilterChange(event: Event, combobox: NgpCombobox): void {
    this.filter.set((event.target as HTMLInputElement).value);
    void combobox.openDropdown();
  }

  protected onValueChange(value: unknown): void {
    this.value.set(value);
    this.onChange(value);
    this.syncFilterWithValue();
  }

  protected onOpenChange(open: boolean): void {
    if (!open) {
      this.syncFilterWithValue();
    }
  }

  writeValue(value: unknown): void {
    this.value.set(value ?? undefined);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }

  private syncFilterWithValue(): void {
    const value = this.value();
    const label = value === undefined || value === null ? '' : this.itemLabel()(value);
    this.filter.set(label);

    const input = this.inputRef();
    if (input) {
      input.nativeElement.value = label;
    }
  }
}
