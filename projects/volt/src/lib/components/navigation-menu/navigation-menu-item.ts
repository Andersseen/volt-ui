import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgpNavigationMenuItem,
  provideNavigationMenuItemState,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'volt-navigation-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuItemState()],
  host: {
    class: 'relative',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuItem,
      inputs: ['ngpNavigationMenuItemValue: value'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenuItem {
  readonly value = input<string>();
}
