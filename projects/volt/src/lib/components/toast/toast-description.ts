import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'volt-toast-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'text-sm text-muted-foreground',
  },
  template: `<ng-content />`,
})
export class VoltToastDescription {}
