import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpMenu } from 'ng-primitives/menu';

@Component({
  selector: 'volt-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMenu],
  host: {
    class:
      'fixed z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
  },
  template: `<ng-content />`,
})
export class VoltDropdownMenu {}
