import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  forwardRef,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  injectDatePickerState,
  NgpDatePicker,
  provideDatePickerConfig,
} from 'ng-primitives/date-picker';
import { NgpNativeDateAdapter, provideDateAdapter } from 'ng-primitives/date-time';
import { cn } from '../../utils';
import { sameDay } from './same-day';

export type VoltDatePickerFirstDayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

@Component({
  selector: 'volt-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideDateAdapter(NgpNativeDateAdapter),
    provideDatePickerConfig({}),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltDatePicker),
      multi: true,
    },
  ],
  hostDirectives: [
    {
      directive: NgpDatePicker,
      inputs: [
        'ngpDatePickerMin: min',
        'ngpDatePickerMax: max',
        'ngpDatePickerDisabled: disabled',
        'ngpDatePickerDateDisabled: dateDisabled',
        'ngpDatePickerFirstDayOfWeek: firstDayOfWeek',
      ],
    },
  ],
  host: {
    '[class]': 'classes()',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `<ng-content />`,
})
export class VoltDatePicker implements ControlValueAccessor {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'grid w-fit gap-3 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-sm',
      this.class()
    )
  );

  private readonly datePickerState = injectDatePickerState<Date>();

  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dateDisabled = input<(date: Date) => boolean>(() => false);
  readonly firstDayOfWeek = input<VoltDatePickerFirstDayOfWeek>(7);
  readonly date = model<Date | undefined>();
  readonly focusedDate = model<Date | undefined>();

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private writtenByForm = false;
  private onChange: (value: Date | undefined) => void = () => {};
  private onTouched: () => void = () => {};
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * The calendar opens on the focused month, which defaults to today. A date set from outside
   * (a form control, a parent) in another month would be selected but off screen, so bring its
   * month into view. Dates the user picks never come through here.
   */
  private showMonthOf(date: Date | null | undefined): void {
    const focused = this.datePickerState().focusedDate();
    if (
      date &&
      (date.getFullYear() !== focused.getFullYear() || date.getMonth() !== focused.getMonth())
    ) {
      this.datePickerState().setFocusedDate(date, 'program', 'forward');
    }
  }

  /** Touched means focus left the whole calendar, not that it moved between its day buttons. */
  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.onTouched();
    }
  }

  constructor() {
    effect(() => {
      this.datePickerState().setDisabled(this.isDisabled());
    });

    // Volt owns `date` and `focusedDate` and mirrors them into the primitive without ever binding
    // the primitive's own inputs: ng-primitives latches into controlled mode the first time they
    // are defined, which froze a static `[date]` (a click emitted and nothing changed) and kept
    // `[(date)]` from ever seeing a calendar click.
    // The template's default (`undefined`) must not erase what a form control wrote first.
    let firstDate = true;
    effect(() => {
      const date = this.date();
      untracked(() => {
        if (!(firstDate && this.writtenByForm) && !sameDay(date, this.datePickerState().date())) {
          this.datePickerState().select(date as Date, false, { emit: false });
          this.showMonthOf(date);
        }
        firstDate = false;
      });
    });
    this.datePickerState().dateChange.subscribe(value => {
      this.date.set(value);
      this.onChange(value);
    });

    // `setFocusedDate` clamps to min/max/disabled and emits no change event of its own, so the
    // primitive's signal is the source for the outbound direction.
    effect(() => {
      const focused = this.focusedDate();
      untracked(() => {
        if (focused && !sameDay(focused, this.datePickerState().focusedDate())) {
          this.datePickerState().setFocusedDate(focused, 'program', 'forward');
        }
      });
    });
    let firstFocused = true;
    effect(() => {
      const focused = this.datePickerState().focusedDate();
      untracked(() => {
        if (!firstFocused && !sameDay(focused, this.focusedDate())) {
          this.focusedDate.set(focused);
        }
        firstFocused = false;
      });
    });
  }

  writeValue(value: Date | undefined | null): void {
    this.writtenByForm = true;
    this.showMonthOf(value);
    // `emit: false`: a form write must sync the calendar without echoing back into the control.
    this.datePickerState().select(value ?? (undefined as unknown as Date), false, { emit: false });
  }

  registerOnChange(fn: (value: Date | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
