import { Directive, input } from '@angular/core';
import { NgpMenuTrigger } from 'ng-primitives/menu';
import type { NgpMenuPlacement } from 'ng-primitives/menu';

@Directive({
  selector: '[voltDropdownMenu]',
  hostDirectives: [
    {
      directive: NgpMenuTrigger,
      inputs: [
        'ngpMenuTrigger: voltDropdownMenu',
        'ngpMenuTriggerPlacement: placement',
        'ngpMenuTriggerOffset: offset',
        'ngpMenuTriggerDisabled: disabled',
      ],
    },
  ],
})
export class VoltDropdownMenuTrigger {
  readonly placement = input<NgpMenuPlacement>('bottom-start');
  readonly offset = input<number>(4);
  readonly disabled = input<boolean>(false);
}
