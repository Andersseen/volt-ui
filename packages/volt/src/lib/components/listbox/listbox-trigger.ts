import { Directive } from '@angular/core';
import { NgpListboxTrigger } from 'ng-primitives/listbox';

@Directive({
  selector: '[voltListboxTrigger]',
  hostDirectives: [NgpListboxTrigger],
})
export class VoltListboxTrigger {}
