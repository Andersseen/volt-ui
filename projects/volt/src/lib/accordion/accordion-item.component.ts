import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpAccordionItem } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpAccordionItem],
  template: `
    <div ngpAccordionItem [ngpAccordionItemValue]="value()" class="border-b border-border/50">
      <ng-content />
    </div>
  `,
})
export class VoltAccordionItem {
  readonly value = input.required<string>();
}
