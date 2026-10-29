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
import {
  injectToggleGroupState,
  NgpToggleGroup,
  provideToggleGroupState,
} from 'ng-primitives/toggle-group';
import { injectFormControlState } from '../../form-control-state';
import { mirrorValue } from '../../mirror-value';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideToggleGroupState(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltToggleGroup),
      multi: true,
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '(focusout)': 'onTouched()',
  },
  hostDirectives: [
    {
      directive: NgpToggleGroup,
      inputs: [
        'ngpToggleGroupType: type',
        'ngpToggleGroupOrientation: orientation',
        'ngpToggleGroupDisabled: disabled',
        'ngpToggleGroupAllowDeselection: allowDeselection',
      ],
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

  private readonly state = injectToggleGroupState();
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
      this.state().setDisabled(this.isDisabled());
    });

    mirrorValue(this.value, this.state, value => {
      this.value.set(value);
      this.onChange(value);
    });
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
    this.state().setDisabled(this.isDisabled());
  }
}
