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
    >
      <ng-content />
    </button>
  `,
})
export class VoltToggle implements ControlValueAccessor {
  readonly variant = input<ToggleVariants['variant']>('default');
  readonly size = input<ToggleVariants['size']>('md');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly pressed = model<boolean>(false);

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
