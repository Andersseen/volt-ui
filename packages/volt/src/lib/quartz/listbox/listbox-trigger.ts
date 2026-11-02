import { Directive } from '@angular/core';

/*
 * `[voltListboxTrigger]` is a marker in the default entry point too: `NgpListboxTrigger` registers
 * a primitive that binds no attribute, listener or state (verified in ng-primitives 0.131). The
 * selector is kept so a template compiles against either backend; there is nothing to port.
 */
@Directive({
  selector: '[voltListboxTrigger]',
})
export class VoltListboxTrigger {}
