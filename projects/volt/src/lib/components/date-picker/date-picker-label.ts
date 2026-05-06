import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpDatePickerLabel } from 'ng-primitives/date-picker';

@Component({
  selector: 'volt-date-picker-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpDatePickerLabel,
      inputs: ['id', 'aria-live'],
    },
  ],
  host: {
    class: 'text-sm font-medium',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerLabel {
  readonly id = input<string>();
  readonly ariaLive = input<string>('polite', { alias: 'aria-live' });
}
