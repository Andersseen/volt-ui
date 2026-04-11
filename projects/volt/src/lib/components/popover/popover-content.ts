import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpPopover } from 'ng-primitives/popover';

@Component({
  selector: 'volt-popover-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpPopover],
  host: {
    class:
      'z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
  },
  template: `<ng-content />`,
})
export class VoltPopoverContent {}
