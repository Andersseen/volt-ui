import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpTabPanel, injectTabPanelState } from 'ng-primitives/tabs';

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
    '[attr.data-state]': "tabPanelState().active() ? 'active' : 'inactive'",
    class:
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=inactive]:hidden',
  },
})
export class VoltTabsContent {
  readonly value = input.required<string>();
  protected readonly tabPanelState = injectTabPanelState();
}
