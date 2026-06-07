import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'volt-select-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'py-1.5 pl-8 pr-2 text-sm font-semibold text-muted-foreground',
  },
  template: `<ng-content></ng-content>`,
})
export class VoltSelectLabel {}
