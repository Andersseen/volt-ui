import { Directive } from '@angular/core';
import { NgpDialogOverlay } from 'ng-primitives/dialog';

@Directive({
  selector: '[voltDialogOverlay]',
  hostDirectives: [
    {
      directive: NgpDialogOverlay,
      inputs: ['ngpDialogOverlayCloseOnClick: closeOnClick'],
    },
  ],
  host: {
    class:
      'fixed inset-0 bg-foreground/50 animate-in fade-in-0 data-[exit]:animate-out data-[exit]:fade-out-0 duration-200',
  },
})
export class VoltDialogOverlay {}
