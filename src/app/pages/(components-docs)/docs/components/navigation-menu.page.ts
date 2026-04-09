import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltNavigationMenu,
  VoltNavigationMenuList,
  VoltNavigationMenuItem,
  VoltNavigationMenuTrigger,
  VoltNavigationMenuContent,
  VoltNavigationMenuContentItem,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { NAVIGATION_MENU_SNIPPET } from '../../../../lib/snippets';

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
  ],
  templateUrl: './navigation-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NavigationMenuDemo {
  readonly navigationMenuCode = NAVIGATION_MENU_SNIPPET;
}
