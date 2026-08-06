import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgpNavigationMenuLink,
  provideNavigationMenuLinkState,
} from 'ng-primitives/navigation-menu';

@Component({
  // Tag-scoped attribute selector (matches ng-primitives' own convention). ESLint's
  // component-selector rule treats `a[...]` as an element selector and checks it
  // against `style: 'kebab-case'`, which a camelCase attribute name never satisfies.
  // eslint-disable-next-line @angular-eslint/component-selector -- tag-scoped attribute selector, not a mistake
  selector: 'a[voltNavigationMenuLink]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuLinkState()],
  host: {
    class:
      'inline-flex h-9 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 cursor-pointer',
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
  readonly active = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}
