import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpSelect, NgpSelectPortal, provideSelectState } from 'ng-primitives/select';

@Component({
  selector: 'volt-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSelect, NgpSelectPortal],
  providers: [
    provideSelectState(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltSelect),
      multi: true,
    },
  ],
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      [ngpSelect] {
        box-sizing: border-box;
        display: flex;
        height: 2.5rem;
        width: 100%;
        cursor: pointer;
        align-items: center;
        justify-content: space-between;
        border: 1px solid var(--input, oklch(0.92 0.006 265));
        border-radius: var(--radius-md, 0.375rem);
        background: var(--background, oklch(1 0 0));
        padding: 0.5rem 0.75rem;
        color: var(--foreground, oklch(0.14 0.006 265));
        font-size: 0.875rem;
        line-height: 1.25rem;
      }

      [ngpSelect]:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      [ngpSelect]:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      [ngpSelect]:focus-visible {
        box-shadow:
          0 0 0 2px var(--background, oklch(1 0 0)),
          0 0 0 4px var(--ring, oklch(0.6 0.22 265));
      }

      [ngpSelect] > span {
        display: block;
        flex: 1 1 0%;
        overflow: hidden;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        pointer-events: none;
      }

      [ngpSelect] > span > span {
        color: var(--muted-foreground, oklch(0.55 0.012 265));
      }

      [ngpSelect] svg {
        height: 1rem;
        width: 1rem;
        flex-shrink: 0;
        opacity: 0.5;
        pointer-events: none;
      }
    `,
  ],
  template: `
    <button
      ngpSelect
      [ngpSelectValue]="value()"
      [ngpSelectDisabled]="isDisabled()"
      [ngpSelectMultiple]="multiple()"
      (ngpSelectValueChange)="onValueChange($event)"
      (blur)="onTouched()"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
    >
      <span class="block text-left truncate flex-1 pointer-events-none">
        @if (value(); as selected) {
          {{ selected }}
        } @else {
          <span class="text-muted-foreground">{{ placeholder() }}</span>
        }
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4 opacity-50 shrink-0 pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <ng-template ngpSelectPortal>
      <ng-content />
    </ng-template>
  `,
})
export class VoltSelect implements ControlValueAccessor {
  readonly placeholder = input('Select an option');
  readonly value = model<unknown>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly valueChange = output<unknown>();

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onValueChange(value: unknown): void {
    this.value.set(value);
    this.valueChange.emit(value);
    this.onChange(value);
  }

  writeValue(value: unknown): void {
    this.value.set(value);
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
}
