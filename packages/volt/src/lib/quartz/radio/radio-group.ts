import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RadioGroupDirective } from '@quartz-headless/primitives';
import { injectFormControlState } from '../../form-control-state';
import { cn } from '../../utils';
import { VoltQuartzIds } from '../../quartz-ids';

/*
 * Quartz Headless backend for `volt-radio-group`; same public contract as the ng-primitives one.
 * Volt owns `value` (a static value is the initial selection, `[(value)]` and Forms keep it in
 * sync). It is written into the directive silently, and only `valueChangeCommitted` — user
 * selections — flows back to the model and to `onChange`.
 */
@Component({
  selector: 'volt-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltRadioGroup),
      multi: true,
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.id]': 'id() || generatedId',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '[class.flex-col]': 'orientation() === "vertical"',
    '[class.flex-row]': 'orientation() === "horizontal"',
    '(focusout)': 'onTouched()',
  },
  hostDirectives: [
    {
      directive: RadioGroupDirective,
      inputs: ['disabled', 'orientation', 'compareWith'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltRadioGroup implements ControlValueAccessor {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('flex gap-2', this.class()));

  private readonly group = inject(RadioGroupDirective, { self: true });
  /** ng-primitives gives every group an id; this one is counted per application, so SSR and the browser agree. */
  protected readonly generatedId = inject(VoltQuartzIds).generate('volt-radio-group');
  protected readonly formControlState = injectFormControlState();

  readonly id = input<string>();
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
  /** The selected value. A static `value` is the initial selection; `[(value)]` keeps it in sync. */
  readonly value = model<string | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly compareWith = input<(a: string | null, b: string | null) => boolean>(Object.is);

  private readonly controlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string | null) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const next = this.value();
      untracked(() => {
        if (this.group.value() !== next) this.group.value.set(next);
      });
    });
    effect(() => this.group.setFormDisabled(this.controlDisabled()));

    this.group.valueChangeCommitted.subscribe((value: string) => {
      this.value.set(value);
      this.onChange(value);
    });
  }

  /** Whether `item` is the selected one, under the group's `compareWith`. */
  isSelected(item: string): boolean {
    const value = this.value();
    return value !== null && this.compareWith()(value, item);
  }

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
