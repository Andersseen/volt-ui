import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
} from '@angular/core';
import { injectDatePickerCellDate, NgpDatePickerDateButton } from 'ng-primitives/date-picker';
import { cn } from '../../utils';

@Component({
  selector: 'volt-date-picker-date-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerDateButton],
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'accessibleName()',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerDateButton {
  readonly class = input<string>('');

  /**
   * The day's accessible name. Defaults to the full date in the app's `LOCALE_ID` ("Wednesday,
   * July 15, 2026"), because the visible text — the day number — names no month or year.
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly date = injectDatePickerCellDate<unknown>();
  private readonly locale = inject(LOCALE_ID);

  protected readonly accessibleName = computed(() => {
    const label = this.ariaLabel();
    if (label) return label;
    return this.date instanceof Date
      ? new Intl.DateTimeFormat(this.locale, { dateStyle: 'full' }).format(this.date)
      : null;
  });

  /**
   * The calendar is drawn on `popover`; in dark palettes `accent` (= `muted`) and `popover` are nearly
   * the same lightness, so hover and the range body tint from `foreground` and `primary` instead.
   */
  protected readonly classes = computed(() =>
    cn(
      'inline-flex size-control-dense cursor-pointer select-none items-center justify-center rounded-sm text-sm transition-colors motion-reduce:transition-none hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring data-[today]:font-semibold data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:cursor-default data-[disabled]:opacity-40 data-[range-between]:bg-primary/15 data-[range-between]:text-foreground data-[range-between]:hover:bg-primary/25 data-[range-start]:rounded-e-none data-[range-end]:rounded-s-none data-[range-start]:data-[range-end]:rounded-sm',
      this.class()
    )
  );
}
