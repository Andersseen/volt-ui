import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpMeterTrack } from 'ng-primitives/meter';

@Component({
  selector: 'volt-meter-track',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMeterTrack],
  host: {
    class: 'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
  },
  styles: [
    `
      :host {
        position: relative;
        display: block;
        height: 0.5rem;
        width: 100%;
        overflow: hidden;
        border-radius: var(--radius-full, 9999px);
        background: var(--secondary, oklch(0.96 0.004 265));
      }
    `,
  ],
  template: `<ng-content />`,
})
export class VoltMeterTrack {}
