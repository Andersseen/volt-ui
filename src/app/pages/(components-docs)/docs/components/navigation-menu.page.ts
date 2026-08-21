import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltNavigationMenu,
  VoltNavigationMenuList,
  VoltNavigationMenuItem,
  VoltNavigationMenuTrigger,
  VoltNavigationMenuContent,
  VoltNavigationMenuContentItem,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { NAVIGATION_MENU_SNIPPET } from '../../../../lib/snippets';
import { NAVIGATION_MENU_USAGE } from '../../../../lib/snippets/usage';
import { NAVIGATION_MENU_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-navigation-menu-demo',
  standalone: true,
  imports: [
    VoltNavigationMenu,
    VoltNavigationMenuList,
    VoltNavigationMenuItem,
    VoltNavigationMenuTrigger,
    VoltNavigationMenuContent,
    VoltNavigationMenuContentItem,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './navigation-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NavigationMenuDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly navigationMenuApi = NAVIGATION_MENU_API;
  readonly navigationMenuCode = NAVIGATION_MENU_SNIPPET;
  readonly navigationMenuUsage = NAVIGATION_MENU_USAGE;
}
