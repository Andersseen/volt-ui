import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TabPanelDirective } from '@quartz-headless/primitives';
import { replaceQuartzIds, VoltQuartzIds } from '../../quartz-ids';
import { cn } from '../../utils';

/* Quartz Headless backend for `volt-tabs-content`; same public contract as the ng-primitives one. */
@Component({
  selector: 'volt-tabs-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': "panel.selected() ? 'active' : 'inactive'",
  },
  hostDirectives: [
    {
      directive: TabPanelDirective,
      inputs: ['qzTabPanel: value'],
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
  protected readonly panel = inject(TabPanelDirective, { self: true });

  constructor() {
    replaceQuartzIds(this.panel, { id: inject(VoltQuartzIds).generate('volt-tabs-panel') });
  }
}
