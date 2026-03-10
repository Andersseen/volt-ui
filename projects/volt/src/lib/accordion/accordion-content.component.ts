import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAccordionContent } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpAccordionContent],
  template: `
    <div class="pb-4 pt-0">
      <ng-content></ng-content>
    </div>
  `,
  host: {
    // ng-primitives manages the visibility, here we provide the animation frames via Tailwind
    class: 'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down w-full block',
  },
})
export class VoltAccordionContent {}
