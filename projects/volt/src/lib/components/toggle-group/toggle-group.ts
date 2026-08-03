import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  injectToggleGroupState,
  NgpToggleGroup,
  provideToggleGroupState,
} from 'ng-primitives/toggle-group';
import { injectFormControlState } from '../../form-control-state';

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
    class: 'inline-flex items-center rounded-md border border-input bg-background p-1 shadow-sm',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '(focusout)': 'onTouched()',
  },
  hostDirectives: [
    {
      directive: NgpToggleGroup,
      inputs: [
        'ngpToggleGroupValue: value',
        'ngpToggleGroupType: type',
        'ngpToggleGroupOrientation: orientation',
        'ngpToggleGroupDisabled: disabled',
        'ngpToggleGroupAllowDeselection: allowDeselection',
      ],
      outputs: ['ngpToggleGroupValueChange: valueChange'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltToggleGroup implements ControlValueAccessor {
  private readonly state = injectToggleGroupState();
  protected readonly formControlState = injectFormControlState();

  readonly value = input<string[]>([]);
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

    this.state().valueChange.subscribe(value => {
      this.onChange(value);
    });
  }

  writeValue(value: string[] | null | undefined): void {
    const nextValue = value ?? [];
    this.state().value.set(nextValue);
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
