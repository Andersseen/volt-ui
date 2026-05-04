import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpDatePickerNextMonth } from 'ng-primitives/date-picker';

@Component({
  selector: 'volt-date-picker-next-month',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerNextMonth],
  host: {
    class:
      'inline-flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerNextMonth {}
