import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import {
  VoltNavigationMenu,
  VoltNavigationMenuItem,
  VoltNavigationMenuLink,
  VoltNavigationMenuList,
} from './index';

@Component({
  imports: [
    VoltNavigationMenu,
    VoltNavigationMenuItem,
    VoltNavigationMenuLink,
    VoltNavigationMenuList,
  ],
  template: `
    <volt-navigation-menu aria-label="Primary">
      <volt-navigation-menu-list>
        <volt-navigation-menu-item value="docs">
          <a voltNavigationMenuLink href="/docs">Documentation</a>
        </volt-navigation-menu-item>
      </volt-navigation-menu-list>
    </volt-navigation-menu>
  `,
})
class NavigationMenuFixture {}

describe('navigation menu components', () => {
  it('render navigation and native link semantics', async () => {
    await render(NavigationMenuFixture);

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');
  });
});
