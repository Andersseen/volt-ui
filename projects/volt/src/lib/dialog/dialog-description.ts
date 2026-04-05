import { Directive } from '@angular/core';
import { NgpDialogDescription } from 'ng-primitives/dialog';

@Directive({
  selector: '[voltDialogDescription]',
  hostDirectives: [NgpDialogDescription],
  host: {
    class: 'text-sm text-muted-foreground',
  },
})
export class VoltDialogDescription {}
