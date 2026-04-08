import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpTabPanel, injectTabPanelState, provideTabPanelState } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabPanelState()],
  host: {
    class:
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=inactive]:hidden',
    '[attr.data-state]': "tabPanelState().active() ? 'active' : 'inactive'",
  },
  hostDirectives: [
    {
      directive: NgpTabPanel,
      inputs: ['ngpTabPanelValue: value'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltTabsContent {
  readonly value = input.required<string>();
  protected readonly tabPanelState = injectTabPanelState();
}
