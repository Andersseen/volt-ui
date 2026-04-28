import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ACCORDION_SNIPPET } from '../../../../lib/snippets';
import { ACCORDION_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-accordion-demo',
  standalone: true,
  imports: [
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
    CodePanel,
  ],
  templateUrl: './accordion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionDemo {
  readonly accordionCode = ACCORDION_SNIPPET;
  readonly accordionUsage = ACCORDION_USAGE;
}
