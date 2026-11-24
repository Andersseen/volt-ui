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
import { injectRadioGroupState, NgpRadioGroup, provideRadioGroupState } from 'ng-primitives/radio';
import type { NgpOrientation } from 'ng-primitives/common';
import { injectFormControlState } from '../../form-control-state';
import { mirrorValue } from '../../mirror-value';
import { ownRovingFocusGroup, provideOwnRovingFocusGroup } from '../../roving-focus';
import { cn } from '../../utils';

@Component({
  selector: 'volt-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideRadioGroupState(),
    // The group owns its arrow keys: inside a tab panel it must not join the tabset's roving
    // group. Inside a toolbar it still joins the toolbar's single tab stop.
    provideOwnRovingFocusGroup({ joinToolbar: true }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltRadioGroup),
      multi: true,
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-invalid]': 'formControlState.invalid() ? "true" : null',
    '[class.flex-col]': 'orientation() === "vertical"',
    '[class.flex-row]': 'orientation() === "horizontal"',
    '(focusout)': 'onFocusOut($event)',
  },
  hostDirectives: [
    {
      directive: NgpRadioGroup,
      inputs: [
        'id: id',
        'ngpRadioGroupDisabled: disabled',
        'ngpRadioGroupOrientation: orientation',
        'ngpRadioGroupCompareWith: compareWith',
      ],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltRadioGroup implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('flex gap-stack', this.class()));

  private readonly state = injectRadioGroupState<string>();
  protected readonly formControlState = injectFormControlState();

  readonly id = input<string>();
  readonly orientation = input<NgpOrientation>('vertical');
  /** The selected value. A static `value` is the initial selection; `[(value)]` keeps it in sync. */
  readonly value = model<string | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly compareWith = input<(a: string | null, b: string | null) => boolean>(Object.is);

  private readonly controlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string | null) => void = () => {};
  protected onTouched: () => void = () => {};

  /** Touched means focus left the whole group, not that it moved between the group's items. */
  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  constructor() {
    // `wrap` stays on, as the primitive sets it: arrow keys cycle through a radio group.
    ownRovingFocusGroup(
      {
        orientation: this.state().orientation,
        disabled: this.state().disabled,
        wrap: signal(true),
      },
      { joinToolbar: true }
    );

    effect(() => {
      this.state().setDisabled(this.isDisabled());
    });
    // Volt's `orientation` defaults to 'vertical', the primitive's to 'horizontal': forwarding
    // only the input left an unbound group laid out as a column that answered Left/Right.
    effect(() => {
      this.state().setOrientation(this.orientation());
    });

    mirrorValue(this.value, this.state, value => {
      this.value.set(value);
      this.onChange(value);
    });
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
    this.state().setDisabled(this.isDisabled());
  }
}
