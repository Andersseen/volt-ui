import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { NgpAccordion } from 'ng-primitives/accordion';
import type { NgpAccordionType } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpAccordion],
  template: `
    <div
      ngpAccordion
      [ngpAccordionType]="type()"
      [ngpAccordionCollapsible]="collapsible()"
      [ngpAccordionValue]="value()"
      [ngpAccordionDisabled]="disabled()"
      [ngpAccordionOrientation]="orientation()"
      (ngpAccordionValueChange)="value.set($event); valueChange.emit($event)"
      class="w-full block"
    >
      <ng-content />
    </div>
  `,
})
export class VoltAccordion {
  readonly type = input<NgpAccordionType>('single');
  readonly collapsible = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly value = model<string | string[] | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
  readonly valueChange = output<string | string[] | null>();
}
