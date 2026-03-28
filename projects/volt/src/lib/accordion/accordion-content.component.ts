import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAccordionContent } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: {
    class:
      'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down w-full block',
  },
  hostDirectives: [NgpAccordionContent],
  template: `
    <div class="pb-4 pt-0">
      <ng-content></ng-content>
    </div>
  `,
})
export class VoltAccordionContent {}
