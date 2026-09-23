import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import {
  NgpNavigationMenuContentItem,
  provideNavigationMenuContentItemState,
} from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';

@Component({
  selector: 'volt-navigation-menu-content-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuContentItemState()],
  host: {
    '[class]': 'classes()',
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
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      this.class()
    )
  );

  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}
