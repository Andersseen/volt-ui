import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpDatePickerDateButton } from 'ng-primitives/date-picker';

@Component({
  selector: 'volt-date-picker-date-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerDateButton],
  host: {
    class:
      'inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[today]:font-semibold data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[outside]:text-muted-foreground data-[outside]:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[between-range]:bg-accent data-[start]:rounded-r-none data-[end]:rounded-l-none',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerDateButton {}
