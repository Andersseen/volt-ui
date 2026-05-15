import { Directive } from '@angular/core';
import { NgpDialogOverlay } from 'ng-primitives/dialog';

@Directive({
  selector: '[voltDrawerOverlay]',
  hostDirectives: [
    {
      directive: NgpDialogOverlay,
      inputs: ['ngpDialogOverlayCloseOnClick: closeOnClick'],
    },
  ],
  host: {
    class:
      'fixed inset-0 bg-foreground/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  },
})
export class VoltDrawerOverlay {}
