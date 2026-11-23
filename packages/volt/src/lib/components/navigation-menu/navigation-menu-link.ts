import { isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  effect,
  ElementRef,
  inject,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import {
  NgpNavigationMenuLink,
  provideNavigationMenuLinkState,
} from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';
import { VoltNavigationMenu } from './navigation-menu';
import { navigationMenuItemVariants } from './variants';

/** The `aria-current` tokens an active navigation link can carry. */
export type VoltNavigationMenuCurrent = 'page' | 'location' | 'step' | 'date' | 'time' | 'true';

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
      inputs: ['ngpNavigationMenuLinkDisabled: disabled'],
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

  /** Marks the link as the current destination: `aria-current` (of the `current` kind) and `data-active`. */
  readonly active = input<boolean, unknown>(false, { transform: booleanAttribute });
  /**
   * What kind of "current" an `active` link is, written to `aria-current`: `page` (default) for the
   * route on screen, `location` for an in-page section (`#about`), `step` for a step in a flow.
   */
  readonly current = input<VoltNavigationMenuCurrent>('page');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  constructor() {
    // Volt owns the "current" mark instead of forwarding `active` to the primitive, which can only
    // write `aria-current="page"`: a section link on a one-page site is the current `location`.
    // The primitive still clears both attributes once when it is created, from an `afterRenderEffect`
    // in the browser and an `effect` on the server. This one is scheduled the same way and created
    // after it, so it runs after it and is the only writer from then on. A host binding would not
    // do: it is not re-applied when the primitive clears the attribute behind it.
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    const schedule = isPlatformBrowser(inject(PLATFORM_ID)) ? afterRenderEffect : effect;
    schedule(() => {
      const active = this.active();
      const current = this.current();
      if (active) {
        renderer.setAttribute(element, 'aria-current', current);
        renderer.setAttribute(element, 'data-active', '');
      } else {
        renderer.removeAttribute(element, 'aria-current');
        renderer.removeAttribute(element, 'data-active');
      }
    });
  }
}
