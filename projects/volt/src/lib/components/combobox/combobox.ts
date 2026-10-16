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
  output,
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
import type { NgpFlipInput } from 'ng-primitives/portal';
import { VoltComboboxOption } from './combobox-option';
import { cn } from '../../utils';

let nextComboboxId = 0;

export type VoltComboboxFilterMode = 'local' | 'manual';

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
    '[class]': 'classes()',
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
      [ngpComboboxDropdownContainer]="container()"
      [ngpComboboxDropdownFlip]="flip()"
      [ngpComboboxScrollToOption]="scrollToOption()"
      [ngpComboboxOptions]="allOptions()"
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
        type="button"
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
        [attr.aria-busy]="loading() ? 'true' : null"
        class="absolute top-full left-0 z-50 mt-1 max-h-[240px] w-[var(--ngp-combobox-width)] overflow-y-auto rounded-md border border-border bg-surface p-1 text-surface-foreground shadow-md outline-none"
      >
        @if (loading()) {
          <div
            class="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground"
            role="presentation"
            data-combobox-loading
            aria-hidden="true"
          >
            <svg
              class="size-4 animate-spin motion-reduce:animate-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {{ loadingText() }}
          </div>
        }
        @for (item of filteredItems(); track trackByFn()($index, item)) {
          <volt-combobox-option [value]="item" [index]="$index">
            <ng-container
              *ngTemplateOutlet="optionTemplate() || defaultTemplate; context: { $implicit: item }"
            />
          </volt-combobox-option>
        } @empty {
          @if (!loading()) {
            <div
              class="px-2 py-1.5 text-sm text-muted-foreground"
              role="presentation"
              data-combobox-empty
              aria-hidden="true"
            >
              {{ emptyText() }}
            </div>
          }
        }
      </div>
    </div>

    <!--
      One polite live region per combobox, outside the portalled dropdown. The visible loading and
      empty rows above are aria-hidden: this is the only place they are announced.
    -->
    <span class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ statusMessage() }}
    </span>

    <ng-template #defaultTemplate let-item>{{ itemLabel()(item) }}</ng-template>
  `,
})
export class VoltCombobox implements ControlValueAccessor {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('block w-full', this.class()));

  readonly id = input(`volt-combobox-${++nextComboboxId}`);
  readonly label = input<string>();
  readonly value = model<unknown>();
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly allowDeselect = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly compareWith = input<(a: unknown, b: unknown) => boolean>(Object.is);
  readonly dropdownPlacement = input<NgpComboboxPlacement>('bottom');
  readonly container = input<string | HTMLElement | null>('body');
  readonly flip = input<NgpFlipInput, NgpFlipInput>(true, {
    transform: (value: NgpFlipInput) => {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value;
    },
  });
  readonly scrollToOption = input<((index: number) => void) | undefined>(undefined);
  readonly allOptions = input<unknown[] | undefined>(undefined);

  /**
   * The options to show. With `filterMode="local"` (default) they are narrowed by `itemLabel` as
   * the user types. With `"manual"` they are rendered exactly as supplied.
   */
  readonly items = input<unknown[]>([]);
  /**
   * Who narrows `items` while the user types.
   *
   * - `local` (default): Volt keeps the items whose label contains the typed text.
   * - `manual`: `items` are already the answer (a server search, a filtered store). Listen to
   *   `(queryChange)`, fetch, and pass the results back; Volt never filters them again.
   */
  readonly filterMode = input<VoltComboboxFilterMode>('local');
  /** Show a loading row (and announce it). Only meaningful with `filterMode="manual"`, but harmless otherwise. */
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loadingText = input<string>('Loading…');
  /** Shown when there are no options and nothing is loading. Interpolate the query yourself for "No matches for …". */
  readonly emptyText = input<string>('No results found.');
  /** Announced to screen readers when results arrive for a typed query. */
  readonly resultsText = input<(count: number) => string>(count =>
    count === 1 ? '1 result available.' : `${count} results available.`
  );
  /**
   * The text the user typed into the field. Emits on typing only — never when Volt writes the
   * selected option's label back into the input after a selection or a close — so it is safe to
   * start a request from it. It is not the value: that is `value` / `(valueChange)`.
   */
  readonly queryChange = output<string>();
  readonly placeholder = input<string>('Select...');
  readonly itemLabel = input<(item: unknown) => string>(item =>
    typeof item === 'string' ? item : String(item)
  );
  readonly trackByFn = input<(index: number, item: unknown) => unknown>((_i, item) => item);
  readonly optionTemplate = contentChild<TemplateRef<unknown>>(TemplateRef);

  private readonly inputRef = viewChild('inputRef', { read: ElementRef<HTMLInputElement> });

  protected readonly filteredItems = computed(() => {
    if (this.filterMode() === 'manual') {
      return this.items();
    }

    const filter = this.filter().trim().toLowerCase();

    if (!filter) {
      return this.items();
    }

    return this.items().filter(item => this.itemLabel()(item).toLowerCase().includes(filter));
  });
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  protected readonly filter = signal('');
  /** What the user typed since the dropdown last closed; '' while the input just shows the selection. */
  private readonly typedQuery = signal('');
  private readonly open = signal(false);

  protected readonly statusMessage = computed(() => {
    if (!this.open()) return '';
    if (this.loading()) return this.loadingText();
    if (!this.typedQuery().trim()) return '';
    const count = this.filteredItems().length;
    return count ? this.resultsText()(count) : this.emptyText();
  });
  private readonly controlDisabled = signal(false);
  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const value = this.value();
      const label = this.getValueLabel(value);
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
    const text = (event.target as HTMLInputElement).value;
    this.filter.set(text);
    this.typedQuery.set(text);
    this.queryChange.emit(text);
    void combobox.openDropdown();
  }

  protected onValueChange(value: unknown): void {
    this.value.set(value);
    this.onChange(value);
    this.syncFilterWithValue();
  }

  protected onOpenChange(open: boolean): void {
    this.open.set(open);
    if (!open) {
      this.typedQuery.set('');
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
    const label = this.getValueLabel(value);
    this.filter.set(label);

    const input = this.inputRef();
    if (input) {
      input.nativeElement.value = label;
    }
  }

  private getValueLabel(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (Array.isArray(value)) {
      return value.map(item => this.itemLabel()(item)).join(', ');
    }

    return this.itemLabel()(value);
  }
}
