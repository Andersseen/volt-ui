import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpAccordionItem, provideAccordionItemState } from 'ng-primitives/accordion';
import { cn } from '../../utils';

@Component({
  selector: 'volt-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [provideAccordionItemState()],
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [
    {
      directive: NgpAccordionItem,
      inputs: ['ngpAccordionItemValue: value'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltAccordionItem {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('border-b border-border/50', this.class()));

  readonly value = input.required<string>();
}
