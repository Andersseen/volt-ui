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
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxPortal,
  type NgpComboboxPlacement,
} from 'ng-primitives/combobox';
import { VoltComboboxOption } from './combobox-option';

let nextComboboxId = 0;

@Component({
  selector: 'volt-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgpCombobox,
    NgpComboboxInput,
    NgpComboboxButton,
    NgpComboboxDropdown,
    NgpComboboxPortal,
    VoltComboboxOption,
    NgTemplateOutlet,
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
      class="relative flex h-9 w-full items-center justify-between rounded-md border border-input bg-background shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring data-[disabled]:opacity-50"
    >
      <input
        #inputRef
        ngpComboboxInput
        [id]="id()"
        [placeholder]="placeholder()"
        [attr.aria-label]="label()"
        (focus)="onInputFocus(combobox)"
        (input)="onFilterChange($event, combobox)"
        (blur)="onTouched()"
        class="h-full flex-1 border-0 bg-transparent px-3 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
      />

      <button
        ngpComboboxButton
        aria-label="Toggle dropdown"
        class="inline-flex h-full w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      >
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
      </button>

      <div
        *ngpComboboxPortal
        ngpComboboxDropdown
        class="absolute top-full left-0 z-50 mt-1 max-h-[240px] w-[var(--ngp-combobox-width)] overflow-y-auto rounded-md border border-border bg-surface p-1 text-surface-foreground shadow-md outline-none"
      >
        @for (item of filteredItems(); track trackByFn()($index, item)) {
          <volt-combobox-option [value]="item" [index]="$index">
            <ng-container
              *ngTemplateOutlet="optionTemplate() || defaultTemplate; context: { $implicit: item }"
            />
          </volt-combobox-option>
        } @empty {
          <div class="px-2 py-1.5 text-sm text-muted-foreground">No results found.</div>
        }
      </div>
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
