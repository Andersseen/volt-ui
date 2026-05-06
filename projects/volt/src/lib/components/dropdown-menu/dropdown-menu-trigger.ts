import { Directive, input } from '@angular/core';
import { NgpMenuTrigger } from 'ng-primitives/menu';
import type { NgpMenuPlacement } from 'ng-primitives/menu';
import type { NgpFlip, NgpOffset, NgpOverlayContent, NgpShift } from 'ng-primitives/portal';

type VoltMenuTriggerType = 'click' | 'hover' | 'focus' | 'enter' | 'arrowkey';

@Directive({
  selector: '[voltDropdownMenu]',
  hostDirectives: [
    {
      directive: NgpMenuTrigger,
      inputs: [
        'ngpMenuTrigger: voltDropdownMenu',
        'ngpMenuTriggerPlacement: placement',
        'ngpMenuTriggerOffset: offset',
        'ngpMenuTriggerFlip: flip',
        'ngpMenuTriggerShift: shift',
        'ngpMenuTriggerContainer: container',
        'ngpMenuTriggerScrollBehavior: scrollBehavior',
        'ngpMenuTriggerCooldown: cooldown',
        'ngpMenuTriggerContext: context',
        'ngpMenuTriggerOpenTriggers: triggers',
        'ngpMenuTriggerShowDelay: showDelay',
        'ngpMenuTriggerHideDelay: hideDelay',
        'ngpMenuTriggerDisabled: disabled',
      ],
    },
  ],
})
export class VoltDropdownMenuTrigger {
  readonly voltDropdownMenu = input<NgpOverlayContent<unknown> | undefined>(undefined);
  readonly placement = input<NgpMenuPlacement>('bottom-start');
  readonly offset = input<NgpOffset>(4);
  readonly flip = input<NgpFlip>(true);
  readonly shift = input<NgpShift>(true);
  readonly container = input<HTMLElement | string | null>(null);
  readonly scrollBehavior = input<'reposition' | 'block' | 'close'>('reposition');
  readonly cooldown = input(0);
  readonly context = input<unknown>(undefined);
  readonly triggers = input<VoltMenuTriggerType[]>(['click']);
  readonly showDelay = input(0);
  readonly hideDelay = input(0);
  readonly disabled = input<boolean>(false);
}
