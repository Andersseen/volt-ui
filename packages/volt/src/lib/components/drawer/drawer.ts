import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpDialogTrigger } from 'ng-primitives/dialog';

@Directive({
  selector: '[voltDrawer]',
  hostDirectives: [
    {
      directive: NgpDialogTrigger,
      inputs: ['ngpDialogTrigger: voltDrawer', 'ngpDialogTriggerCloseOnEscape: closeOnEscape'],
      outputs: ['ngpDialogTriggerClosed: closed'],
    },
  ],
})
export class VoltDrawer {
  readonly closeOnEscape = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly closed = output<unknown>();
}
