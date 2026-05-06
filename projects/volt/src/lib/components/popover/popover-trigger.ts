import { Directive, input, output } from '@angular/core';
import { NgpPopoverTrigger } from 'ng-primitives/popover';
import type { NgpPopoverPlacement } from 'ng-primitives/popover';
import type { NgpFlip, NgpOffset, NgpOverlayContent, NgpShift } from 'ng-primitives/portal';

@Directive({
  selector: '[voltPopover]',
  hostDirectives: [
    {
      directive: NgpPopoverTrigger,
      inputs: [
        'ngpPopoverTrigger: voltPopover',
        'ngpPopoverTriggerPlacement: placement',
        'ngpPopoverTriggerOffset: offset',
        'ngpPopoverTriggerShowDelay: showDelay',
        'ngpPopoverTriggerHideDelay: hideDelay',
        'ngpPopoverTriggerFlip: flip',
        'ngpPopoverTriggerShift: shift',
        'ngpPopoverTriggerContainer: container',
        'ngpPopoverTriggerScrollBehavior: scrollBehavior',
        'ngpPopoverTriggerContext: context',
        'ngpPopoverTriggerAnchor: anchor',
        'ngpPopoverTriggerTrackPosition: trackPosition',
        'ngpPopoverTriggerCooldown: cooldown',
        'ngpPopoverTriggerDisabled: disabled',
        'ngpPopoverTriggerCloseOnOutsideClick: closeOnOutsideClick',
        'ngpPopoverTriggerCloseOnEscape: closeOnEscape',
      ],
      outputs: ['ngpPopoverTriggerOpenChange: openChange'],
    },
  ],
})
export class VoltPopoverTrigger {
  readonly voltPopover = input<NgpOverlayContent<unknown> | undefined>(undefined);
  readonly placement = input<NgpPopoverPlacement>('bottom');
  readonly offset = input<NgpOffset>(8);
  readonly showDelay = input(0);
  readonly hideDelay = input(0);
  readonly flip = input<NgpFlip>(true);
  readonly shift = input<NgpShift>(true);
  readonly container = input<HTMLElement | string | null>(null);
  readonly scrollBehavior = input<'reposition' | 'block' | 'close'>('reposition');
  readonly context = input<unknown>(undefined);
  readonly anchor = input<HTMLElement | null>(null);
  readonly trackPosition = input(false);
  readonly cooldown = input(0);
  readonly disabled = input<boolean>(false);
  readonly closeOnOutsideClick = input<boolean>(true);
  readonly closeOnEscape = input<boolean>(true);
  readonly openChange = output<boolean>();
}
