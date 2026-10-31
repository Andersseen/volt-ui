import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxDirective } from '@quartz-headless/primitives';
import { injectFormControlState } from '../../form-control-state';
import { forwardAttributesFromHost } from '../../host-forwarding';

let nextCheckboxId = 0;

/*
 * Quartz Headless backend for `volt-checkbox`. Public contract identical to the ng-primitives
 * one: Volt keeps `checked` and `indeterminate` as two models; Quartz folds them into one
 * `boolean | 'indeterminate'`, mapped at this boundary. Quartz only reports user activations
 * through `checkedChangeCommitted`, so programmatic writes never reach `onChange`.
 */
@Component({
  selector: 'volt-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckboxDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltCheckbox),
      multi: true,
    },
  ],
  template: `
    <button
      qzCheckbox
      [attr.tabindex]="isDisabled() ? -1 : 0"
      [id]="id()"
      [checked]="state()"
      [disabled]="isDisabled()"
      [attr.aria-required]="required() ? 'true' : null"
      [attr.aria-label]="ariaLabel() || ariaLabelAttribute() || null"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      [attr.data-checked]="checked() ? '' : null"
      [attr.data-indeterminate]="indeterminate() ? '' : null"
      [attr.data-disabled]="isDisabled() ? '' : null"
      (checkedChangeCommitted)="onCommitted($event)"
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
  protected readonly formControlState = injectFormControlState();

  readonly id = input(`volt-checkbox-${++nextCheckboxId}`);
  /** Accessible name for a checkbox without a visible `<label>`. */
  readonly ariaLabel = input('');
  /** Same as `ariaLabel`, for the attribute spelling consumers write naturally. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- mirrors VoltSwitch: `ariaLabel` owns the camelCase name
  readonly ariaLabelAttribute = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly checked = model(false);
  readonly indeterminate = model(false);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  /** Volt's two models folded into Quartz's single tri-state. */
  protected readonly state = computed<boolean | 'indeterminate'>(() =>
    this.indeterminate() ? 'indeterminate' : this.checked()
  );

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    // Both belong to the native button; a copy on the host would duplicate them.
    forwardAttributesFromHost('id', 'aria-label');
  }

  protected onCommitted(next: boolean | 'indeterminate'): void {
    // Activating a mixed checkbox resolves to checked, as it does with ng-primitives.
    const value = next === true;
    this.indeterminate.set(false);
    this.checked.set(value);
    this.onChange(value);
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
