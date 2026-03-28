import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpAccordionItem, provideAccordionItemState } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [provideAccordionItemState()],
  host: {
    class: 'border-b border-border/50',
  },
  hostDirectives: [
    {
      directive: NgpAccordionItem,
      inputs: ['ngpAccordionItemValue: value'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltAccordionItem {
  readonly value = input.required<string>();
}
