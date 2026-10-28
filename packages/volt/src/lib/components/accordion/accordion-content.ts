import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpAccordionContent } from 'ng-primitives/accordion';
import { cn } from '../../utils';

@Component({
  selector: 'volt-accordion-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [NgpAccordionContent],
  template: `
    <div class="min-h-0">
      <div class="pb-4 pt-0">
        <ng-content />
      </div>
    </div>
  `,
})
export class VoltAccordionContent {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'grid grid-rows-[0fr] data-[open]:grid-rows-[1fr] transition-[grid-template-rows] duration-200 ease-in-out overflow-hidden text-sm w-full block',
      this.class()
    )
  );
}
