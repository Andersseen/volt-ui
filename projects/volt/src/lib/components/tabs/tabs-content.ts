import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpTabPanel, injectTabPanelState, provideTabPanelState } from 'ng-primitives/tabs';
import { cn } from '../../utils';

@Component({
  selector: 'volt-tabs-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabPanelState()],
  host: {
    '[class]': 'classes()',
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
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'block mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=inactive]:hidden',
      this.class()
    )
  );

  readonly value = input.required<string>();
  protected readonly tabPanelState = injectTabPanelState();
}
