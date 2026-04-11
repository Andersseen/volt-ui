import { Directive, input, output } from '@angular/core';
import { NgpPopoverTrigger } from 'ng-primitives/popover';
import type { NgpPopoverPlacement } from 'ng-primitives/popover';

@Directive({
  selector: '[voltPopover]',
  hostDirectives: [
    {
      directive: NgpPopoverTrigger,
      inputs: [
        'ngpPopoverTrigger: voltPopover',
        'ngpPopoverTriggerPlacement: placement',
        'ngpPopoverTriggerOffset: offset',
        'ngpPopoverTriggerDisabled: disabled',
        'ngpPopoverTriggerCloseOnOutsideClick: closeOnOutsideClick',
        'ngpPopoverTriggerCloseOnEscape: closeOnEscape',
      ],
      outputs: ['ngpPopoverTriggerOpenChange: openChange'],
    },
  ],
})
export class VoltPopoverTrigger {
  readonly placement = input<NgpPopoverPlacement>('bottom');
  readonly offset = input<number>(8);
  readonly disabled = input<boolean>(false);
  readonly closeOnOutsideClick = input<boolean>(true);
  readonly closeOnEscape = input<boolean>(true);
  readonly openChange = output<boolean>();
}
