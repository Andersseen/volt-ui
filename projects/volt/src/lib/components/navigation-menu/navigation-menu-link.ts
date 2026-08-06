import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import {
  NgpNavigationMenuLink,
  provideNavigationMenuLinkState,
} from 'ng-primitives/navigation-menu';

@Component({
  // `volt-navigation-menu-link` is deprecated (kebab-case, inconsistent with every
  // other tag-scoped attribute selector in this library, e.g. `voltComboboxInput`,
  // `voltNativeSelect`) — kept working until v1.0, see the constructor warning below.
  // eslint-disable-next-line @angular-eslint/component-selector -- deprecated alias, not a mistake
  selector: 'a[volt-navigation-menu-link], a[voltNavigationMenuLink]',
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

  constructor() {
    if (isDevMode()) {
      const element = inject(ElementRef).nativeElement as HTMLElement;
      if (element.hasAttribute('volt-navigation-menu-link')) {
        console.warn(
          '[Volt UI] The `volt-navigation-menu-link` attribute selector is deprecated ' +
            'and will be removed in v1.0. Use `voltNavigationMenuLink` instead ' +
            '(matches the CLI-transformed `uiNavigationMenuLink` in consumer projects).'
        );
      }
    }
  }
}
