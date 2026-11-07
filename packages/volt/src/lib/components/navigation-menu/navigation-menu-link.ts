import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  inject,
} from '@angular/core';
import {
  NgpNavigationMenuLink,
  provideNavigationMenuLinkState,
} from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';
import { VoltNavigationMenu } from './navigation-menu';
import { navigationMenuItemVariants } from './variants';

@Component({
  // Tag-scoped attribute selector (matches ng-primitives' own convention). ESLint's
  // component-selector rule treats `a[...]` as an element selector and checks it
  // against `style: 'kebab-case'`, which a camelCase attribute name never satisfies.
  // eslint-disable-next-line @angular-eslint/component-selector -- tag-scoped attribute selector, not a mistake
  selector: 'a[voltNavigationMenuLink]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuLinkState()],
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuLink,
      inputs: ['ngpNavigationMenuLinkActive: active', 'ngpNavigationMenuLinkDisabled: disabled'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenuLink {
  readonly class = input<string>('');

  private readonly menu = inject(VoltNavigationMenu, { optional: true });

  protected readonly classes = computed(() =>
    cn(navigationMenuItemVariants({ variant: this.menu?.variant() ?? 'subtle' }), this.class())
  );

  readonly active = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}
