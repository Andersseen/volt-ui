import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { ACCORDION_SNIPPET } from '../../../../lib/snippets';
import { ACCORDION_USAGE } from '../../../../lib/snippets/usage';
import { ACCORDION_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-accordion-demo',
  standalone: true,
  imports: [
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './accordion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionDemo {
  readonly accordionApi = ACCORDION_API;
  readonly accordionCode = ACCORDION_SNIPPET;
  readonly accordionUsage = ACCORDION_USAGE;
}
