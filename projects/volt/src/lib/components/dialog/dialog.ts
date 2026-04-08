import { Directive, output } from '@angular/core';
import { NgpDialogTrigger } from 'ng-primitives/dialog';

@Directive({
  selector: '[voltDialog]',
  hostDirectives: [
    {
      directive: NgpDialogTrigger,
      inputs: ['ngpDialogTrigger: voltDialog'],
      outputs: ['ngpDialogTriggerClosed: closed'],
    },
  ],
})
export class VoltDialog {
  readonly closed = output<unknown>();
}
