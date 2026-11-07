import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  VoltNavigationMenu,
  VoltNavigationMenuList,
  VoltNavigationMenuItem,
  VoltNavigationMenuTrigger,
  VoltNavigationMenuContent,
  VoltNavigationMenuContentItem,
  VoltNavigationMenuLink,
  VoltToggleGroup,
  VoltToggleGroupItem,
  type VoltNavigationMenuLayout,
  type VoltNavigationMenuVariant,
} from 'volt';
import { CodePanel } from '@shared/components/code-panel';
import { Prose } from '@shared/components/prose';
import { ApiReference } from '../../../../components/api-reference';
import { NAVIGATION_MENU_SNIPPET } from '../../../../lib/snippets/index';
import { NAVIGATION_MENU_USAGE } from '../../../../lib/snippets/usage';
import { NAVIGATION_MENU_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '@shared/i18n/i18n';
import {
  COMPONENT_LINKS,
  GETTING_STARTED_LINKS,
  NAV_LAYOUTS,
  NAV_VARIANTS,
  usageFor,
} from './navigation-menu.demo';

@Component({
  selector: 'app-navigation-menu-demo',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    VoltNavigationMenu,
    VoltNavigationMenuList,
    VoltNavigationMenuItem,
    VoltNavigationMenuTrigger,
    VoltNavigationMenuContent,
    VoltNavigationMenuContentItem,
    VoltNavigationMenuLink,
    VoltToggleGroup,
    VoltToggleGroupItem,
    CodePanel,
    Prose,
    ApiReference,
  ],
  templateUrl: './navigation-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NavigationMenuDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly variants = NAV_VARIANTS;
  protected readonly layouts = NAV_LAYOUTS;
  protected readonly gettingStarted = GETTING_STARTED_LINKS;
  protected readonly componentLinks = COMPONENT_LINKS;

  /** Toggle groups hold an array; `allowDeselection` is off, so there is always exactly one. */
  protected readonly variantValue = signal<string[]>(['subtle']);
  protected readonly layoutValue = signal<string[]>(['inline']);

  protected readonly variant = computed(
    () => (this.variantValue()[0] ?? 'subtle') as VoltNavigationMenuVariant
  );
  protected readonly layout = computed(
    () => (this.layoutValue()[0] ?? 'inline') as VoltNavigationMenuLayout
  );

  readonly navigationMenuApi = NAVIGATION_MENU_API;
  readonly navigationMenuCode = NAVIGATION_MENU_SNIPPET;
  protected readonly navigationMenuUsage = computed(() =>
    usageFor(NAVIGATION_MENU_USAGE, this.variant(), this.layout())
  );
}
