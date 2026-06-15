import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'volt-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSwitch, NgpSwitchThumb],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltSwitch),
      multi: true,
    },
  ],
  template: `
    <button
      ngpSwitch
      [ngpSwitchChecked]="checked()"
      [ngpSwitchDisabled]="isDisabled()"
      (ngpSwitchCheckedChange)="onCheckedChange($event)"
      (blur)="onTouched()"
      class="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[checked]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
    >
      <span
        ngpSwitchThumb
        class="pointer-events-none block h-4 w-4 translate-x-0 rounded-full bg-background shadow-sm ring-0 transition-transform data-[checked]:translate-x-4"
      ></span>
    </button>
  `,
})
export class VoltSwitch implements ControlValueAccessor {
  readonly checked = model(false);
  readonly disabled = input(false);

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onCheckedChange(value: boolean): void {
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
