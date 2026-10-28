import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import {
  NgpNavigationMenuList,
  provideNavigationMenuListState,
} from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';

@Component({
  selector: 'volt-navigation-menu-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuListState()],
  host: {
    '[class]': 'classes()',
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
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('group flex flex-1 list-none items-center justify-center gap-1', this.class())
  );

  readonly wrap = input<boolean, unknown>(false, { transform: booleanAttribute });
}
