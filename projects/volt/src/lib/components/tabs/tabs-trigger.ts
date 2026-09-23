import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpTabButton, injectTabButtonState, provideTabButtonState } from 'ng-primitives/tabs';
import { cn } from '../../utils';

@Component({
  selector: 'volt-tabs-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabButtonState()],
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': "tabButtonState().active() ? 'active' : 'inactive'",
  },
  hostDirectives: [
    {
      directive: NgpTabButton,
      inputs: ['ngpTabButtonValue: value'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltTabsTrigger {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer data-[state=active]:border data-[state=active]:border-input data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      this.class()
    )
  );

  readonly value = input.required<string>();
  protected readonly tabButtonState = injectTabButtonState();
}
