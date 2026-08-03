import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpMeterValue } from 'ng-primitives/meter';

@Component({
  selector: 'volt-meter-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMeterValue],
  host: {
    class: 'block text-sm text-muted-foreground',
  },
  template: `<ng-content />`,
})
export class VoltMeterValue {}
