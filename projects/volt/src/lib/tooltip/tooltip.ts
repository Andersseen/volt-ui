import { Directive, input } from '@angular/core';
import { NgpTooltipTrigger } from 'ng-primitives/tooltip';
import type { NgpTooltipPlacement } from 'ng-primitives/tooltip';

@Directive({
  selector: '[voltTooltip]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: [
        'ngpTooltipTrigger: voltTooltip',
        'ngpTooltipTriggerPlacement: placement',
        'ngpTooltipTriggerOffset: offset',
        'ngpTooltipTriggerShowDelay: delay',
        'ngpTooltipTriggerHideDelay: closeDelay',
        'ngpTooltipTriggerDisabled: disabled',
        'ngpTooltipTriggerUseTextContent: useTextContent',
      ],
    },
  ],
})
export class VoltTooltip {
  readonly placement = input<NgpTooltipPlacement>('top');
  readonly offset = input<number>(8);
  readonly delay = input<number>(300);
  readonly closeDelay = input<number>(100);
  readonly disabled = input<boolean>(false);
  readonly useTextContent = input<boolean>(false);
}
