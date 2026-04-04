import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgpNavigationMenuContent,
  provideNavigationMenuContentState,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'volt-navigation-menu-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuContentState()],
  host: {
    class:
      'fixed z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-md hidden data-[open]:block',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuContent,
      inputs: [
        'ngpNavigationMenuContentOrientation: orientation',
        'ngpNavigationMenuContentWrap: wrap',
      ],
    },
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenuContent {
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly wrap = input<boolean>(false);
}
