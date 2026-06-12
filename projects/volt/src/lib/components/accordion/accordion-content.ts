import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAccordionContent } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'grid grid-rows-[0fr] data-[open]:grid-rows-[1fr] transition-[grid-template-rows] duration-200 ease-in-out overflow-hidden text-sm w-full block',
  },
  hostDirectives: [NgpAccordionContent],
  template: `
    <div class="min-h-0">
      <div class="pb-4 pt-0">
        <ng-content />
      </div>
    </div>
  `,
})
export class VoltAccordionContent {}
