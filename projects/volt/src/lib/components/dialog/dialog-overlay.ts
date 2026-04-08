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
    class: 'fixed inset-0 bg-black/50 transition-opacity duration-300',
  },
})
export class VoltDialogOverlay {}
