import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpAccordionItem } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpAccordionItem,
      inputs: ['ngpAccordionItemValue: value'],
    },
  ],
  template: `<ng-content></ng-content>`,
  host: {
    class: 'border-b border-border/50',
  },
})
export class VoltAccordionItem {
  readonly value = input.required<string>();
}
