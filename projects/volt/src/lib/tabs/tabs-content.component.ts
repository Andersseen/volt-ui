import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpTabPanel } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpTabPanel,
      inputs: ['ngpTabPanelValue: value'],
    },
  ],
  template: `<ng-content></ng-content>`,
  host: {
    class:
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
})
export class VoltTabsContent {
  readonly value = input.required<string>();
}
