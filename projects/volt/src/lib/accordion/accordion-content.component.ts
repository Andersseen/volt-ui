import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAccordionContent } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpAccordionContent],
  template: `
    <div
      ngpAccordionContent
      class="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down w-full block"
    >
      <div class="pb-4 pt-0">
        <ng-content />
      </div>
    </div>
  `,
})
export class VoltAccordionContent {}
