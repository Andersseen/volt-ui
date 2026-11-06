import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgpTabButton, injectTabButtonState, provideTabButtonState } from 'ng-primitives/tabs';
import { cn } from '../../utils';

@Component({
  selector: 'volt-tabs-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabButtonState()],
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': "tabButtonState().active() ? 'active' : 'inactive'",
    // WAI-ARIA tabs, manual activation: Enter / Space activate the focused tab. ng-primitives only
    // selects on click and (with activateOnFocus) on focus; the trigger is not a native button.
    '(keydown.enter)': 'activate($event)',
    '(keydown.space)': 'activate($event)',
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
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-inset-sm py-item-y text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring focus-visible:ring-offset-(length:--ring-offset-width) disabled:pointer-events-none disabled:opacity-50 cursor-pointer data-[state=active]:border data-[state=active]:border-input data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      this.class()
    )
  );

  readonly value = input.required<string>();
  protected readonly tabButtonState = injectTabButtonState();
  private readonly tabButton = inject(NgpTabButton);

  protected activate(event: Event): void {
    event.preventDefault(); // Space would scroll the page.
    if (this.tabButton.disabled() || this.tabButton.active()) return;
    this.tabButton.select();
  }
}
