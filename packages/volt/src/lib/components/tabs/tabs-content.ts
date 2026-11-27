import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpTabPanel, injectTabPanelState, provideTabPanelState } from 'ng-primitives/tabs';
import { cn } from '../../utils';

@Component({
  selector: 'volt-tabs-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `inherit: false`: the panels of a tabset nested in this panel must not share (and overwrite)
  // this panel's state, which hid the outer panel as soon as the inner tabset rendered.
  providers: [provideTabPanelState({ inherit: false })],
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
      'block mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-(length:--ring-width) focus-visible:ring-ring focus-visible:ring-offset-(length:--ring-offset-width) data-[state=inactive]:hidden',
      this.class()
    )
  );

  readonly value = input.required<string>();
  protected readonly tabPanelState = injectTabPanelState();
}
