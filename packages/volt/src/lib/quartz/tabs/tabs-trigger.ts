import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  type OnInit,
} from '@angular/core';
import { TabDirective } from '@quartz-headless/primitives';
import { replaceQuartzIds, VoltQuartzIds } from '../../quartz-ids';
import { cn } from '../../utils';
import { VoltTabs } from './tabs';

/* Quartz Headless backend for `volt-tabs-trigger`; same public contract as the ng-primitives one. */
@Component({
  selector: 'volt-tabs-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': "tab.selected() ? 'active' : 'inactive'",
    '(click)': 'tabs.userSelected(value())',
    '(keydown.enter)': '$event.preventDefault(); host.click()',
    '(keydown.space)': '$event.preventDefault(); host.click()',
  },
  hostDirectives: [
    {
      directive: TabDirective,
      inputs: ['qzTab: value'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltTabsTrigger implements OnInit {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer data-[state=active]:border data-[state=active]:border-input data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      this.class()
    )
  );

  readonly value = input.required<string>();
  protected readonly tab = inject(TabDirective, { self: true });
  protected readonly tabs = inject(VoltTabs);
  protected readonly host = this.tab.element();

  constructor() {
    replaceQuartzIds(this.tab, { id: inject(VoltQuartzIds).generate('volt-tabs-trigger') });
  }

  /* Runs after Quartz registered the tab (its `ngOnInit` is first): a returning tab is selected again. */
  ngOnInit(): void {
    this.tabs.tabRegistered();
  }
}
