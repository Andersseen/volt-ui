import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpTabPanel, injectTabPanelState } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpTabPanel],
  template: `
    <div
      ngpTabPanel
      [ngpTabPanelValue]="value()"
      [attr.data-state]="tabPanelState().active() ? 'active' : 'inactive'"
      class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=inactive]:hidden"
    >
      <ng-content />
    </div>
  `,
})
export class VoltTabsContent {
  readonly value = input.required<string>();
  protected readonly tabPanelState = injectTabPanelState();
}
