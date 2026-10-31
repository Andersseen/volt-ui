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
import { SwitchDirective } from '@quartz-headless/primitives';
import { injectFormControlState } from '../../form-control-state';
import { forwardAttributesFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

let nextSwitchId = 0;

/* Quartz Headless backend for `volt-switch`; same public contract as the ng-primitives one. */
@Component({
  selector: 'volt-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SwitchDirective],
  host: {
    '[class]': 'classes()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltSwitch),
      multi: true,
    },
  ],
  template: `
    <button
      qzSwitch
      [attr.tabindex]="isDisabled() ? -1 : 0"
      [id]="id()"
      [checked]="checked()"
      [disabled]="isDisabled()"
      [attr.aria-label]="ariaLabel() || ariaLabelAttribute() || null"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      [attr.data-checked]="checked() ? '' : null"
      [attr.data-disabled]="isDisabled() ? '' : null"
      (checkedChangeCommitted)="onCommitted($event)"
      (blur)="onTouched()"
      class="relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-input bg-input p-0 transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary"
    >
      <span
        [attr.data-checked]="checked() ? '' : null"
        [attr.data-disabled]="isDisabled() ? '' : null"
        class="pointer-events-none block h-5 w-5 translate-x-[2px] rounded-full bg-background shadow-sm ring-0 transition-transform duration-150 ease-in-out data-[checked]:translate-x-[18px]"
      ></span>
    </button>
  `,
})
export class VoltSwitch implements ControlValueAccessor {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('inline-flex', this.class()));

  protected readonly formControlState = injectFormControlState();

  readonly id = input(`volt-switch-${++nextSwitchId}`);
  readonly ariaLabel = input('');
  /** Same as `ariaLabel`, for the attribute spelling consumers write naturally. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `ariaLabel` (1.0) already owns the camelCase name
  readonly ariaLabelAttribute = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly checked = model(false);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    // Both belong to the native switch button, not the host.
    forwardAttributesFromHost('id', 'aria-label');
  }

  protected onCommitted(value: boolean): void {
    this.checked.set(value);
    this.onChange(value);
  }

  writeValue(value: boolean | null | undefined): void {
    this.checked.set(!!value);
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
