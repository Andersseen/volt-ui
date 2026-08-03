import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import {
  VoltNavigationMenu,
  VoltNavigationMenuContent,
  VoltNavigationMenuItem,
  VoltNavigationMenuLink,
  VoltNavigationMenuList,
  VoltNavigationMenuTrigger,
} from './index';

@Component({
  imports: [
    VoltNavigationMenu,
    VoltNavigationMenuContent,
    VoltNavigationMenuItem,
    VoltNavigationMenuLink,
    VoltNavigationMenuList,
    VoltNavigationMenuTrigger,
  ],
  template: `
    <volt-navigation-menu aria-label="Primary">
      <volt-navigation-menu-list>
        <volt-navigation-menu-item value="docs">
          <a voltNavigationMenuLink href="/docs">Documentation</a>
        </volt-navigation-menu-item>
        <volt-navigation-menu-item value="products">
          <volt-navigation-menu-trigger [content]="productsTpl">
            Products
          </volt-navigation-menu-trigger>
        </volt-navigation-menu-item>
      </volt-navigation-menu-list>
    </volt-navigation-menu>

    <ng-template #productsTpl>
      <volt-navigation-menu-content>Product overview</volt-navigation-menu-content>
    </ng-template>
  `,
})
class NavigationMenuFixture {}

describe('navigation menu components', () => {
  it('render navigation and native link semantics', async () => {
    await render(NavigationMenuFixture);

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('button', { name: /Products/i })).toBeInTheDocument();
  });
});
