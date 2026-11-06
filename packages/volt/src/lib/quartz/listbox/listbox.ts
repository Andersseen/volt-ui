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
import { ListboxDirective, ListboxService } from '@quartz-headless/primitives';
import { injectFormControlState } from '../../form-control-state';
import { overrideQuartzInput, VoltQuartzIds } from '../../quartz-ids';
import { cn } from '../../utils';

export type VoltListboxMode = 'single' | 'multiple';

/*
 * Quartz Headless backend for `volt-listbox`. Volt's public value is always a `T[]`; Quartz's is
 * `T | null` in single mode and `T[]` in multiple mode. The two shapes meet here and only here:
 * `toQuartz` narrows on the way in, `fromQuartz` widens on the way out, so a consumer's data model
 * does not change with the backend. A `T` that is itself an array is not supported in single mode.
 *
 * Quartz's `multiple` is a boolean input; Volt's is `mode`. The directive's field is replaced by a
 * signal derived from `mode` (see `overrideQuartzInput`), which is why `multiple` is not exposed.
 */
@Component({
  selector: 'volt-listbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltListbox),
      multi: true,
    },
  ],
  hostDirectives: [
    {
      directive: ListboxDirective,
      inputs: ['disabled', 'compareWith'],
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.id]': 'id() ?? generatedId',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(focus)': 'onFocus()',
    '(blur)': 'focused.set(false)',
    '(focusout)': 'onTouched()',
  },
  template: `<ng-content />`,
})
export class VoltListbox<T = unknown> implements ControlValueAccessor {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'grid min-w-[12rem] gap-1 rounded-md border-(length:--border-width) border-border bg-popover p-1 text-popover-foreground shadow-sm outline-none',
      this.class()
    )
  );

  private readonly listbox = inject<ListboxDirective<T>>(ListboxDirective, { self: true });
  private readonly service = inject(ListboxService, { self: true });
  protected readonly formControlState = injectFormControlState();
  protected readonly generatedId = inject(VoltQuartzIds).generate('volt-listbox');

  readonly id = input<string>();
  readonly mode = input<VoltListboxMode>('single');
  readonly value = model<T[]>([]);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);

  /** Whether the listbox has focus; an option is only `data-active` while it does. */
  readonly focused = signal(false);

  private readonly controlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: T[]) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    overrideQuartzInput(
      this.listbox,
      'multiple',
      computed(() => this.mode() === 'multiple')
    );

    effect(() => {
      const next = this.toQuartz(this.value(), this.mode());
      untracked(() => this.listbox.value.set(next as T | T[]));
    });
    effect(() => this.listbox.setFormDisabled(this.controlDisabled()));

    this.listbox.valueChangeCommitted.subscribe(next => {
      const value = this.fromQuartz(next);
      this.value.set(value);
      this.onChange(value);
    });
  }

  /** Entering the listbox lands on the selected option (else the one Quartz already activated). */
  protected onFocus(): void {
    this.focused.set(true);
    const selected = this.service.options().find(option => option.selected());
    if (selected) this.service.setActive(selected.id);
  }

  private toQuartz(value: T[], mode: VoltListboxMode): T | T[] | null {
    if (mode === 'multiple') return [...value];
    return value.length ? value[0] : null;
  }

  private fromQuartz(next: T | T[] | null): T[] {
    if (next === null) return [];
    return Array.isArray(next) ? [...next] : [next];
  }

  writeValue(value: T[] | null | undefined): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
