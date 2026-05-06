import { Directive } from '@angular/core';
import { NgpAutofill } from 'ng-primitives/autofill';

@Directive({
  selector: '[voltAutofill]',
  hostDirectives: [
    {
      directive: NgpAutofill,
      outputs: ['ngpAutofill: autofillChange'],
    },
  ],
})
export class VoltAutofill {}
