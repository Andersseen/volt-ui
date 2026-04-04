import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgpNavigationMenuLink,
  provideNavigationMenuLinkState,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'a[volt-navigation-menu-link]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuLinkState()],
  host: {
    class:
      'inline-flex h-9 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 cursor-pointer',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuLink,
      inputs: [
        'ngpNavigationMenuLinkActive: active',
        'ngpNavigationMenuLinkDisabled: disabled',
      ],
    },
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenuLink {
  readonly active = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}
