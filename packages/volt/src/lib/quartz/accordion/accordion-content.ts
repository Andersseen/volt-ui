import {
  type AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { AccordionItemDirective, AccordionPanelDirective } from '@quartz-headless/primitives';
import { injectAttributeWriter } from '../../quartz-attributes';
import { cn } from '../../utils';

/*
 * Quartz Headless backend for `volt-accordion-content`; same public contract as the ng-primitives one.
 * Quartz hides a closed panel with `hidden`, i.e. `display: none`, which cannot animate. The panel
 * is `hidden` for assistive technology and the keyboard just the same through `visibility:
 * hidden`, which switches off at the END of the grid-row transition and on at its start.
 */
@Component({
  selector: 'volt-accordion-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-open]': 'item.open() ? "" : null',
    '[attr.data-closed]': 'item.open() ? null : ""',
  },
  hostDirectives: [AccordionPanelDirective],
  template: `
    <div class="min-h-0">
      <div class="pb-4 pt-0">
        <ng-content />
      </div>
    </div>
  `,
})
export class VoltAccordionContent implements AfterViewChecked {
  readonly class = input<string>('');

  protected readonly item = inject(AccordionItemDirective);

  protected readonly classes = computed(() =>
    cn(
      'grid grid-rows-[0fr] data-[open]:grid-rows-[1fr] transition-[grid-template-rows,visibility] duration-200 ease-in-out motion-reduce:transition-none overflow-hidden text-sm w-full block invisible data-[open]:visible',
      this.class()
    )
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly writeAttributes = injectAttributeWriter();

  /* Written after Quartz's `hidden` binding, so the prerendered HTML carries the visibility rule alone. */
  ngAfterViewChecked(): void {
    this.writeAttributes(this.host, { hidden: null });
  }
}
