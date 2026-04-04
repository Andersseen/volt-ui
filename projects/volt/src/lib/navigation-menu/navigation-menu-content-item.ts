import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgpNavigationMenuContentItem,
  provideNavigationMenuContentItemState,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'volt-navigation-menu-content-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuContentItemState()],
  host: {
    class:
      'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuContentItem,
      inputs: ['ngpNavigationMenuContentItemDisabled: disabled'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenuContentItem {
  readonly disabled = input<boolean>(false);
}
