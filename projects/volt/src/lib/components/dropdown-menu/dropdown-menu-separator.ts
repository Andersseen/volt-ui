import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'volt-dropdown-menu-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: '-mx-1 my-1 h-px bg-border',
    role: 'separator',
  },
  template: ``,
})
export class VoltDropdownMenuSeparator {}
