import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpMeterIndicator } from 'ng-primitives/meter';

@Component({
  selector: 'volt-meter-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMeterIndicator],
  host: {
    class: 'h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out',
  },
  template: ``,
})
export class VoltMeterIndicator {}
