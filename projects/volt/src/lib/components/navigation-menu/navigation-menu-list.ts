import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgpNavigationMenuList,
  provideNavigationMenuListState,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'volt-navigation-menu-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuListState()],
  host: {
    class: 'group flex flex-1 list-none items-center justify-center gap-1',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuList,
      inputs: ['ngpNavigationMenuListWrap: wrap'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenuList {
  readonly wrap = input<boolean>(false);
}
