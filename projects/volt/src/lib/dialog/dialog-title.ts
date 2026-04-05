import { Directive } from '@angular/core';
import { NgpDialogTitle } from 'ng-primitives/dialog';

@Directive({
  selector: '[voltDialogTitle]',
  hostDirectives: [NgpDialogTitle],
  host: {
    class: 'text-lg font-semibold leading-none tracking-tight',
  },
})
export class VoltDialogTitle {}
