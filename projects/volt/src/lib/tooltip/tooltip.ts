import { Directive, input } from '@angular/core';
import { NgpTooltipTrigger } from 'ng-primitives/tooltip';
import type { Placement } from '@floating-ui/dom';

@Directive({
  selector: '[voltTooltip]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: [
        'ngpTooltipTrigger: voltTooltip',
        'ngpTooltipTriggerPlacement: placement',
        'ngpTooltipTriggerShowDelay: delay',
        'ngpTooltipTriggerHideDelay: closeDelay',
        'ngpTooltipTriggerDisabled: disabled',
      ],
    },
  ],
})
export class VoltTooltip {
  readonly tooltip = input<any>(undefined, { alias: 'voltTooltip' });
  readonly placement = input<Placement>('top');
  readonly delay = input<number>(300);
  readonly closeDelay = input<number>(100);
  readonly disabled = input<boolean>(false);
}
