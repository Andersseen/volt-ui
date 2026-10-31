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
import { ToggleGroupDirective } from '@quartz-headless/primitives';
import { injectFormControlState } from '../../form-control-state';
import { cn } from '../../utils';

/*
 * Quartz Headless backend for `volt-toggle-group`. Volt's public value is always a `string[]`;
 * Quartz's is `T | null` in single mode and `T[]` in multiple mode. The two shapes meet here
 * and only here: `toQuartz` narrows on the way in, `fromQuartz` widens on the way out, so a
 * consumer's data model does not change with the backend.
 */
@Component({
  selector: 'volt-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltToggleGroup),
      multi: true,
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '(focusout)': 'onTouched()',
  },
  hostDirectives: [
    {
      directive: ToggleGroupDirective,
      inputs: ['type', 'orientation', 'disabled', 'allowDeselection'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltToggleGroup implements ControlValueAccessor {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex items-center rounded-md border border-input bg-background p-1 shadow-sm',
      this.class()
    )
  );

  private readonly group = inject(ToggleGroupDirective, { self: true });
  protected readonly formControlState = injectFormControlState();

  /** Pressed item values. A static `value` is the initial state; `[(value)]` keeps it in sync. */
  readonly value = model<string[]>([]);
  readonly type = input<'single' | 'multiple'>('single');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly allowDeselection = input<boolean, unknown>(true, { transform: booleanAttribute });

  private readonly controlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string[]) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const next = this.toQuartz(this.value(), this.type());
      untracked(() => this.group.value.set(next));
    });
    effect(() => this.group.setFormDisabled(this.controlDisabled()));

    this.group.valueChangeCommitted.subscribe((next: string | string[] | null) => {
      const value = this.fromQuartz(next);
      this.value.set(value);
      this.onChange(value);
    });
  }

  /** Whether `item` is pressed. Single mode shows at most one, the first of the written values. */
  isPressed(item: string): boolean {
    const value = this.value();
    return this.type() === 'multiple' ? value.includes(item) : value[0] === item;
  }

  private toQuartz(value: string[], type: 'single' | 'multiple'): string | string[] | null {
    if (type === 'multiple') return [...new Set(value)];
    return value[0] ?? null;
  }

  private fromQuartz(next: string | string[] | null): string[] {
    if (next === null) return [];
    return Array.isArray(next) ? [...next] : [next];
  }

  writeValue(value: string[] | null | undefined): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
