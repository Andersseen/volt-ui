import { Directive, output } from '@angular/core';
import { NgpDialogTrigger } from 'ng-primitives/dialog';

@Directive({
  selector: '[voltDrawer]',
  hostDirectives: [
    {
      directive: NgpDialogTrigger,
      inputs: ['ngpDialogTrigger: voltDrawer'],
      outputs: ['ngpDialogTriggerClosed: closed'],
    },
  ],
})
export class VoltDrawer {
  readonly closed = output<unknown>();
}
