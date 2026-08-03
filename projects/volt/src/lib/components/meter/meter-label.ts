import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpMeterLabel } from 'ng-primitives/meter';

@Component({
  selector: 'volt-meter-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpMeterLabel,
      inputs: ['id'],
    },
  ],
  host: {
    class: 'block text-sm font-medium text-foreground',
  },
  template: `<ng-content />`,
})
export class VoltMeterLabel {}
