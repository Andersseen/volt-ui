import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAccordionTrigger, injectAccordionItemState } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: {
    class: 'block w-full',
  },
  hostDirectives: [NgpAccordionTrigger],
  template: `
    <button
      type="button"
      class="flex w-full flex-1 items-center justify-between py-4 font-medium text-left transition-all hover:underline"
    >
      <ng-content></ng-content>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4 shrink-0 transition-transform duration-200"
        [class.rotate-180]="itemState().open()"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  `,
})
export class VoltAccordionTrigger {
  protected readonly itemState = injectAccordionItemState();
}
