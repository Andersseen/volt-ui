import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  computed,
} from '@angular/core';
import type { NgpAccordionType } from 'ng-primitives/accordion';
import { NgpAccordion, provideAccordionState } from 'ng-primitives/accordion';
import { cn } from '../../utils';

@Component({
  selector: 'volt-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideAccordionState()],
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [
    {
      directive: NgpAccordion,
      inputs: [
        'ngpAccordionType: type',
        'ngpAccordionCollapsible: collapsible',
        'ngpAccordionValue: value',
        'ngpAccordionDisabled: disabled',
        'ngpAccordionOrientation: orientation',
      ],
      outputs: ['ngpAccordionValueChange: valueChange'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltAccordion {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('w-full block', this.class()));

  readonly type = input<NgpAccordionType>('single');
  readonly collapsible = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly value = model<string | string[] | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
}
