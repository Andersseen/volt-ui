import { Directive } from '@angular/core';
import { NgpDialogDescription } from 'ng-primitives/dialog';

@Directive({
  selector: '[voltDrawerDescription]',
  hostDirectives: [NgpDialogDescription],
  host: {
    class: 'text-sm text-muted-foreground',
  },
})
export class VoltDrawerDescription {}
