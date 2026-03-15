import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpTabButton, injectTabButtonState } from 'ng-primitives/tabs';

@Component({
  selector: 'button[volt-tabs-trigger]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpTabButton,
      inputs: ['ngpTabButtonValue: value'],
    },
  ],
  template: `<ng-content></ng-content>`,
  host: {
    '[attr.data-state]': "tabButtonState().active() ? 'active' : 'inactive'",
    class:
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  },
})
export class VoltTabsTrigger {
  readonly value = input.required<string>();
  protected readonly tabButtonState = injectTabButtonState();
}
