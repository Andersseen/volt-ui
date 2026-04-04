import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  input,
} from '@angular/core';
import {
  NgpNavigationMenuTrigger,
  provideNavigationMenuTriggerState,
} from 'ng-primitives/navigation-menu';

export type NavigationMenuPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

@Component({
  selector: 'volt-navigation-menu-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuTriggerState()],
  host: {
    class:
      'group/trigger inline-flex h-9 items-center justify-center gap-1 rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[open]:bg-accent/50',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuTrigger,
      inputs: [
        'ngpNavigationMenuTrigger: content',
        'ngpNavigationMenuTriggerPlacement: placement',
        'ngpNavigationMenuTriggerOffset: offset',
        'ngpNavigationMenuTriggerFlip: flip',
        'ngpNavigationMenuTriggerDisabled: disabled',
        'ngpNavigationMenuTriggerCooldown: cooldown',
      ],
    },
  ],
  template: `
    <ng-content />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-4 w-4 transition-transform duration-200 group-data-[open]/trigger:rotate-180"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  `,
})
export class VoltNavigationMenuTrigger {
  readonly content = input.required<TemplateRef<unknown>>();
  readonly placement = input<NavigationMenuPlacement>('bottom-start');
  readonly offset = input<number>(4);
  readonly flip = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly cooldown = input<number>(300);
}
