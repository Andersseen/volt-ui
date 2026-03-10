import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAccordion } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpAccordion],
  template: `<ng-content></ng-content>`,
  host: {
    class: 'w-full',
  },
})
export class VoltAccordion {}
