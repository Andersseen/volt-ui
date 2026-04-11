import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'volt-dropdown-menu-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'px-2 py-1.5 text-xs font-semibold text-muted-foreground',
  },
  template: `<ng-content />`,
})
export class VoltDropdownMenuLabel {}
