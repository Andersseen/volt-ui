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
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

let nextSwitchId = 0;

@Component({
  selector: 'volt-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSwitch, NgpSwitchThumb],
  host: {
    class: 'inline-flex',
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
      ngpSwitch
      [id]="id()"
      [ngpSwitchChecked]="checked()"
      [ngpSwitchDisabled]="isDisabled()"
      (ngpSwitchCheckedChange)="onCheckedChange($event)"
      (blur)="onTouched()"
      class="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary"
    >
      <span
        ngpSwitchThumb
        class="pointer-events-none block h-5 w-5 translate-x-0 rounded-full bg-background shadow-lg ring-0 transition-transform data-[checked]:translate-x-5"
      ></span>
    </button>
  `,
})
export class VoltSwitch implements ControlValueAccessor {
  readonly id = input(`volt-switch-${++nextSwitchId}`);
  readonly checked = model(false);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

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
