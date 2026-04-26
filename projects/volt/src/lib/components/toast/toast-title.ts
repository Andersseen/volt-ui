import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'volt-toast-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'text-sm font-semibold text-foreground',
  },
  template: `<ng-content />`,
})
export class VoltToastTitle {}
