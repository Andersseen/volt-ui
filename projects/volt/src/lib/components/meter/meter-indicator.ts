import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpMeterIndicator } from 'ng-primitives/meter';

@Component({
  selector: 'volt-meter-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMeterIndicator],
  host: {
    class: 'h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out',
  },
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        border-radius: var(--radius-full, 9999px);
        background: var(--primary, oklch(0.6 0.22 265));
        transition: width 300ms ease-in-out;
      }
    `,
  ],
  template: ``,
})
export class VoltMeterIndicator {}
