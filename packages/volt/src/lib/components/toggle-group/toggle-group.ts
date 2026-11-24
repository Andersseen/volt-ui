import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  forwardRef,
  inject,
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
import { ownRovingFocusGroup, provideOwnRovingFocusGroup } from '../../roving-focus';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideToggleGroupState(),
    // The group owns its arrow keys: inside a tab panel it must not join the tabset's roving
    // group. Inside a toolbar it still joins the toolbar's single tab stop.
    provideOwnRovingFocusGroup({ joinToolbar: true }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltToggleGroup),
      multi: true,
    },
  ],
  host: {
    '[class]': 'classes()',
    // Single mode renders its items as `role="radio"`, which must be owned by a radiogroup;
    // the primitive always writes `group`. Multiple mode keeps `group` (toggle buttons).
    '[attr.role]': 'type() === "multiple" ? "group" : "radiogroup"',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '(focusout)': 'onFocusOut($event)',
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex items-center rounded-md border-(length:--volt-control-border-width) border-input bg-background p-1 shadow-sm',
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

  /** Touched means focus left the whole group, not that it moved between the group's items. */
  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  constructor() {
    ownRovingFocusGroup(
      {
        orientation: this.state().orientation,
        disabled: this.state().disabled,
        wrap: inject(NgpToggleGroup).wrap,
      },
      { joinToolbar: true }
    );

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
