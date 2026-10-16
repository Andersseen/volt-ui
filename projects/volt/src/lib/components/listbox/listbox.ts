import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectListboxState, NgpListbox, provideListboxState } from 'ng-primitives/listbox';
import type { NgpSelectionMode } from 'ng-primitives/common';
import { injectFormControlState } from '../../form-control-state';
import { mirrorValue } from '../../mirror-value';
import { cn } from '../../utils';

@Component({
  selector: 'volt-listbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideListboxState(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltListbox),
      multi: true,
    },
  ],
  hostDirectives: [
    {
      directive: NgpListbox,
      inputs: [
        'id',
        'ngpListboxMode: mode',
        'ngpListboxDisabled: disabled',
        'ngpListboxCompareWith: compareWith',
      ],
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(focusout)': 'onTouched()',
  },
  template: `<ng-content />`,
})
export class VoltListbox<T = unknown> implements ControlValueAccessor {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'grid min-w-[12rem] gap-1 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-sm outline-none',
      this.class()
    )
  );

  private readonly listboxState = injectListboxState<T>();
  protected readonly formControlState = injectFormControlState();

  readonly id = input<string>();
  readonly mode = input<NgpSelectionMode>('single');
  readonly value = model<T[]>([]);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);

  private readonly controlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: T[]) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      this.listboxState()?.setDisabled(this.isDisabled());
    });

    mirrorValue(
      this.value,
      () => this.listboxState()!,
      value => {
        this.value.set(value);
        this.onChange(value);
      }
    );
  }

  writeValue(value: T[] | null | undefined): void {
    // The model is mirrored into the primitive's state, so setting it is enough.
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
