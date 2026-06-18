import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpTooltip } from 'ng-primitives/tooltip';

@Component({
  selector: 'volt-tooltip-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpTooltip],
  host: {
    class:
      'fixed z-50 max-w-xs select-none overflow-hidden rounded-sm bg-foreground px-3 py-1.5 text-xs leading-tight font-medium text-background shadow-md',
  },
  template: `<ng-content />`,
})
export class VoltTooltipContent {}
