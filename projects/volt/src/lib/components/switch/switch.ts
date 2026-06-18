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
  styles: [
    `
      [ngpSwitch] {
        box-sizing: border-box;
        display: inline-flex;
        height: 1.25rem;
        width: 2.25rem;
        flex-shrink: 0;
        cursor: pointer;
        align-items: center;
        border: 2px solid transparent;
        border-radius: var(--radius-full, 9999px);
        background: color-mix(
          in oklch,
          var(--muted-foreground, oklch(0.55 0.012 265)) 20%,
          transparent
        );
        transition-property: color, background-color, border-color, outline-color, box-shadow;
        transition-duration: 150ms;
      }

      [ngpSwitch][data-checked] {
        background: var(--primary, oklch(0.6 0.22 265));
      }

      [ngpSwitch][data-disabled],
      [ngpSwitch]:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      [ngpSwitch]:focus-visible {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow:
          0 0 0 2px var(--background, oklch(1 0 0)),
          0 0 0 4px var(--ring, oklch(0.6 0.22 265));
      }

      [ngpSwitchThumb] {
        pointer-events: none;
        display: block;
        height: 1rem;
        width: 1rem;
        border-radius: var(--radius-full, 9999px);
        background: var(--background, oklch(1 0 0));
        box-shadow: var(--volt-shadow-sm, 0 1px 2px 0 oklch(0 0 0 / 0.05));
        transform: translateX(0);
        transition: transform 150ms ease-in-out;
      }

      [ngpSwitchThumb][data-checked] {
        transform: translateX(1rem);
      }
    `,
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
