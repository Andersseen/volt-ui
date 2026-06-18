import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpTooltipTrigger } from 'ng-primitives/tooltip';
import type { NgpTooltipPlacement } from 'ng-primitives/tooltip';
import type {
  NgpFlip,
  NgpOffset,
  NgpOverlayContent,
  NgpPosition,
  NgpShift,
} from 'ng-primitives/portal';

@Directive({
  selector: '[voltTooltip]',
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: [
        'ngpTooltipTrigger: voltTooltip',
        'ngpTooltipTriggerPlacement: placement',
        'ngpTooltipTriggerOffset: offset',
        'ngpTooltipTriggerShowDelay: delay',
        'ngpTooltipTriggerHideDelay: closeDelay',
        'ngpTooltipTriggerFlip: flip',
        'ngpTooltipTriggerShift: shift',
        'ngpTooltipTriggerContainer: container',
        'ngpTooltipTriggerShowOnOverflow: showOnOverflow',
        'ngpTooltipTriggerContext: context',
        'ngpTooltipTriggerDisabled: disabled',
        'ngpTooltipTriggerUseTextContent: useTextContent',
        'ngpTooltipTriggerTrackPosition: trackPosition',
        'ngpTooltipTriggerPosition: position',
        'ngpTooltipTriggerScrollBehavior: scrollBehavior',
        'ngpTooltipTriggerCooldown: cooldown',
      ],
    },
  ],
})
export class VoltTooltip {
  readonly voltTooltip = input<NgpOverlayContent<unknown> | string | null>(null);
  readonly placement = input<NgpTooltipPlacement>('top');
  readonly offset = input<NgpOffset>(8);
  readonly delay = input<number>(300);
  readonly closeDelay = input<number>(100);
  readonly flip = input<NgpFlip>(true);
  readonly shift = input<NgpShift>(true);
  readonly container = input<HTMLElement | string | null>(null);
  readonly showOnOverflow = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly context = input<unknown>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly useTextContent = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly trackPosition = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly position = input<NgpPosition | null>(null);
  readonly scrollBehavior = input<'reposition' | 'close'>('reposition');
  readonly cooldown = input(300);
}
