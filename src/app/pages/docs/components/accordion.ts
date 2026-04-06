import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent } from 'volt';
import { CodePanel } from '../../../components/code-panel';
import { ACCORDION_SNIPPET } from '../../../lib/snippets';

@Component({
  selector: 'app-accordion-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
    CodePanel,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Accordion</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A vertically stacked set of interactive headings that each reveal a section of content.
        </p>
      </div>

      <div
        class="border rounded-xl border-border/50 p-6 md:p-10 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden min-h-[400px]"
      >
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>

        <div
          class="relative z-10 w-full max-w-lg bg-background p-6 rounded-lg shadow-sm border border-border/50"
        >
          <volt-accordion>
            <volt-accordion-item value="item-1">
              <volt-accordion-trigger>Is it accessible?</volt-accordion-trigger>
              <volt-accordion-content>
                Yes. It adheres to the WAI-ARIA design pattern, powered by ng-primitives.
              </volt-accordion-content>
            </volt-accordion-item>

            <volt-accordion-item value="item-2">
              <volt-accordion-trigger>Is it styled with Tailwind CSS?</volt-accordion-trigger>
              <volt-accordion-content>
                Yes. It comes with default styles that matches the other components' aesthetic.
              </volt-accordion-content>
            </volt-accordion-item>

            <volt-accordion-item value="item-3">
              <volt-accordion-trigger>Is it animated?</volt-accordion-trigger>
              <volt-accordion-content>
                Yes. It's animated by default, but you can disable it if you prefer.
              </volt-accordion-content>
            </volt-accordion-item>
          </volt-accordion>
        </div>
      </div>

      <!-- Source Code Section -->
      <app-code-panel
        title="Component Source"
        [code]="accordionCode"
        cliCommand="npx github:Andersseen/volt-ui add accordion"
        description="Copy this code to your project. The component uses ng-primitives/accordion."
      />
    </div>
  `,
})
export default class AccordionDemo {
  readonly accordionCode = ACCORDION_SNIPPET;
}
