import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpDatePickerCell } from 'ng-primitives/date-picker';

@Component({
  selector: 'volt-date-picker-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerCell],
  host: {
    class: 'relative size-9 p-0 text-center text-sm',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerCell {}
