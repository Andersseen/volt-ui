import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
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
    VoltNavigationMenuItem,
    VoltNavigationMenuLink,
    VoltNavigationMenuList,
  ],
  template: `
    <volt-navigation-menu aria-label="Legacy">
      <volt-navigation-menu-list>
        <volt-navigation-menu-item value="legacy">
          <a volt-navigation-menu-link [active]="true" href="/legacy">Legacy</a>
        </volt-navigation-menu-item>
      </volt-navigation-menu-list>
    </volt-navigation-menu>
  `,
})
class LegacySelectorFixture {}

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
          <a voltNavigationMenuLink [active]="true" href="/docs">Documentation</a>
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
    const link = screen.getByRole('link', { name: 'Documentation' });
    expect(link).toHaveAttribute('href', '/docs');
    // Confirms the voltNavigationMenuLink directive actually attached (not just an
    // inert HTML attribute) — data-active is set by NgpNavigationMenuLink itself.
    expect(link).toHaveAttribute('data-active');
    expect(screen.getByRole('button', { name: /Products/i })).toBeInTheDocument();
  });

  it('does not warn for the current voltNavigationMenuLink selector', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await render(NavigationMenuFixture);
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('still supports the deprecated volt-navigation-menu-link selector and warns once', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await render(LegacySelectorFixture);

    const link = screen.getByRole('link', { name: 'Legacy' });
    expect(link).toHaveAttribute('href', '/legacy');
    expect(link).toHaveAttribute('data-active');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('volt-navigation-menu-link'));

    warnSpy.mockRestore();
  });
});
