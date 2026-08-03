import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpProgressValue } from 'ng-primitives/progress';

@Component({
  selector: 'volt-progress-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpProgressValue],
  host: {
    class: 'block text-sm text-muted-foreground',
  },
  template: `<ng-content />`,
})
export class VoltProgressValue {}
