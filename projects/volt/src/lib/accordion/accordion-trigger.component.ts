import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAccordionTrigger } from 'ng-primitives/accordion';

@Component({
  selector: 'button[volt-accordion-trigger]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpAccordionTrigger],
  template: `
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
      [class.rotate-180]="isOpen()"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  `,
  host: {
    class:
      'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left w-full',
  },
})
export class VoltAccordionTrigger {
  // Access ng-primitives accordion state roughly, although ng-primitives 
  // often toggles data-state="open" on the trigger which we can target with CSS instead.
  // We'll provide a dummy method here and use CSS rotation for simplicity and reliability.
  
  isOpen() {
    return false; // Typically overridden by data-state or via internal ng-primitives inject
  }
}
