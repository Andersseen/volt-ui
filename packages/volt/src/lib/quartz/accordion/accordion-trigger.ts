import {
  type AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { AccordionItemDirective, AccordionTriggerDirective } from '@quartz-headless/primitives';
import { injectAttributeWriter } from '../../quartz-attributes';
import { cn } from '../../utils';
import { VoltAccordion } from './accordion';

/*
 * Quartz Headless backend for `volt-accordion-trigger`; same public contract as the ng-primitives
 * one. The button is the trigger, exactly as in the default backend.
 */
@Component({
  selector: 'volt-accordion-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccordionTriggerDirective],
  host: {
    '[class]': 'classes()',
    '(click)': 'accordion.userToggled()',
  },
  template: `
    <button
      #control
      qzAccordionTrigger
      type="button"
      [attr.data-open]="item.open() ? '' : null"
      [attr.data-closed]="item.open() ? null : ''"
      [attr.data-disabled]="item.itemDisabled() ? '' : null"
      class="group flex w-full flex-1 items-center justify-between py-4 font-medium text-left transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ng-content />
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
        class="h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none group-data-[open]:rotate-180"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  `,
})
export class VoltAccordionTrigger implements AfterViewChecked {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('block w-full', this.class()));

  protected readonly item = inject(AccordionItemDirective);
  protected readonly accordion = inject(VoltAccordion);
  private readonly writeAttributes = injectAttributeWriter();
  private readonly control = viewChild.required<ElementRef<HTMLElement>>('control');

  /*
   * Quartz makes the accordion one tab stop and moves between triggers with the arrow keys.
   * ng-primitives (and Volt's contract) puts every enabled trigger in the Tab order; the arrow
   * keys still work. Written after Quartz's `tabindex` binding, server and browser alike.
   */
  ngAfterViewChecked(): void {
    this.writeAttributes(this.control().nativeElement, {
      tabindex: this.item.itemDisabled() ? '-1' : '0',
    });
  }
}
