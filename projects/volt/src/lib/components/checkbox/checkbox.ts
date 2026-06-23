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
import { NgpCheckbox } from 'ng-primitives/checkbox';

let nextCheckboxId = 0;

@Component({
  selector: 'volt-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpCheckbox],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltCheckbox),
      multi: true,
    },
  ],
  template: `
    <button
      ngpCheckbox
      [id]="id()"
      [ngpCheckboxChecked]="checked()"
      [ngpCheckboxIndeterminate]="indeterminate()"
      [ngpCheckboxDisabled]="isDisabled()"
      [ngpCheckboxRequired]="required()"
      (ngpCheckboxCheckedChange)="onCheckedChange($event)"
      (ngpCheckboxIndeterminateChange)="onIndeterminateChange($event)"
      (blur)="onTouched()"
      class="peer flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary data-[checked]:text-primary-foreground data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground"
    >
      @if (indeterminate()) {
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      } @else if (checked()) {
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      }
    </button>
  `,
})
export class VoltCheckbox implements ControlValueAccessor {
  readonly id = input(`volt-checkbox-${++nextCheckboxId}`);
  readonly checked = model(false);
  readonly indeterminate = model(false);
  readonly indeterminateChange = output<boolean>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onCheckedChange(value: boolean): void {
    this.checked.set(value);
    this.onChange(value);
  }

  protected onIndeterminateChange(value: boolean): void {
    this.indeterminate.set(value);
    this.indeterminateChange.emit(value);
  }

  writeValue(value: boolean | null | undefined): void {
    this.checked.set(!!value);
    // Reset indeterminate when a new value is written programmatically.
    this.indeterminate.set(false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
