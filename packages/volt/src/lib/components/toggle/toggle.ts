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
import { NgpToggle } from 'ng-primitives/toggle';
import { forwardAttributesFromHost } from '../../host-forwarding';
import { injectFormControlState } from '../../form-control-state';
import { toggleVariants, type ToggleVariants } from './variants';

@Component({
  selector: 'volt-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpToggle],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltToggle),
      multi: true,
    },
  ],
  template: `
    <button
      ngpToggle
      type="button"
      [ngpToggleDisabled]="isDisabled()"
      [ngpToggleSelected]="pressed()"
      (ngpToggleSelectedChange)="onSelectedChange($event)"
      (blur)="onTouched()"
      [class]="classes()"
      [attr.data-disabled]="isDisabled() ? '' : null"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      [attr.aria-label]="ariaLabel() || ariaLabelAttribute() || null"
    >
      <ng-content />
    </button>
  `,
})
export class VoltToggle implements ControlValueAccessor {
  protected readonly formControlState = injectFormControlState();

  readonly variant = input<ToggleVariants['variant']>('default');
  readonly size = input<ToggleVariants['size']>('md');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly pressed = model<boolean>(false);
  /** Accessible name — required for an icon-only toggle. Lands on the native button. */
  readonly ariaLabel = input('');
  /** Same as `ariaLabel`, for the attribute spelling consumers write naturally. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- mirrors VoltSwitch: `ariaLabel` owns the camelCase name
  readonly ariaLabelAttribute = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  protected readonly classes = computed(() =>
    toggleVariants({
      variant: this.variant(),
      size: this.size(),
    })
  );

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    // The name belongs to the native button; a copy on the host would be a second, unfocusable one.
    forwardAttributesFromHost('aria-label');
  }

  protected onSelectedChange(value: boolean): void {
    this.pressed.set(value);
    this.onChange(value);
  }

  writeValue(value: boolean | null | undefined): void {
    this.pressed.set(!!value);
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
