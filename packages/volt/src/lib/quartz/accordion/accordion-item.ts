import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  type OnInit,
} from '@angular/core';
import { AccordionItemDirective } from '@quartz-headless/primitives';
import { replaceQuartzIds, VoltQuartzIds } from '../../quartz-ids';
import { cn } from '../../utils';
import { VoltAccordion } from './accordion';

/* Quartz Headless backend for `volt-accordion-item`; same public contract as the ng-primitives one. */
@Component({
  selector: 'volt-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-open]': 'item.open() ? "" : null',
    '[attr.data-closed]': 'item.open() ? null : ""',
    '[attr.data-disabled]': 'item.itemDisabled() ? "" : null',
  },
  hostDirectives: [
    {
      directive: AccordionItemDirective,
      inputs: ['qzAccordionItem: value'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltAccordionItem implements OnInit {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('border-b border-border/50', this.class()));

  readonly value = input.required<string>();
  protected readonly item = inject(AccordionItemDirective, { self: true });

  private readonly accordion = inject(VoltAccordion);

  constructor() {
    const id = inject(VoltQuartzIds).generate('volt-accordion');
    replaceQuartzIds(this.item, { id: `${id}-trigger`, panelId: `${id}-panel` });
  }

  /* After Quartz registered the item (its `ngOnInit` is first): a returning item is open again. */
  ngOnInit(): void {
    this.accordion.itemRegistered();
  }
}
