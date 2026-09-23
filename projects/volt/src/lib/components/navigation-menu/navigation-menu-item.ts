import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import {
  NgpNavigationMenuItem,
  provideNavigationMenuItemState,
} from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';

@Component({
  selector: 'volt-navigation-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuItemState()],
  host: {
    '[class]': 'classes()',
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
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('relative', this.class()));

  readonly value = input<string>();
}
