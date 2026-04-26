import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpMeterTrack } from 'ng-primitives/meter';

@Component({
  selector: 'volt-meter-track',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMeterTrack],
  host: {
    class: 'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
  },
  template: `<ng-content />`,
})
export class VoltMeterTrack {}
