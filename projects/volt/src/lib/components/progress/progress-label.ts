import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpProgressLabel } from 'ng-primitives/progress';

@Component({
  selector: 'volt-progress-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpProgressLabel,
      inputs: ['id'],
    },
  ],
  host: {
    class: 'block text-sm font-medium text-foreground',
  },
  template: `<ng-content />`,
})
export class VoltProgressLabel {}
