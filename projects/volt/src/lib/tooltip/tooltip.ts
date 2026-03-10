import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpTooltipTrigger } from 'ng-primitives/tooltip';
import type { Placement } from '@floating-ui/dom';

@Component({
  selector: 'volt-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: [
        'ngpTooltipTriggerPlacement: placement',
        'ngpTooltipTriggerShowDelay: delay',
        'ngpTooltipTriggerHideDelay: closeDelay',
        'ngpTooltipTriggerDisabled: disabled',
      ],
    },
  ],
  template: `<ng-content />`,
})
export class VoltTooltip {
  readonly placement = input<Placement>('top');
  readonly delay = input<number>(300);
  readonly closeDelay = input<number>(100);
  readonly disabled = input<boolean>(false);
}
