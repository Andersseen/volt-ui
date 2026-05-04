import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpDatePickerGrid } from 'ng-primitives/date-picker';

@Component({
  selector: 'volt-date-picker-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerGrid],
  host: {
    class: 'grid gap-1',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerGrid {}
