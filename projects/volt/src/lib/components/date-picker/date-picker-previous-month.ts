import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpDatePickerPreviousMonth } from 'ng-primitives/date-picker';

@Component({
  selector: 'volt-date-picker-previous-month',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerPreviousMonth],
  host: {
    class:
      'inline-flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerPreviousMonth {}
