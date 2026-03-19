import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpAccordion } from 'ng-primitives/accordion';
import type { NgpAccordionType } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  template: `<ng-content></ng-content>`,
  host: {
    class: 'w-full block',
  },
})
export class VoltAccordion {
  readonly type = input<NgpAccordionType>('single');
  readonly collapsible = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly value = input<string | string[] | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
}
