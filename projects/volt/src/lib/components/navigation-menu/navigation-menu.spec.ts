import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  VoltNavigationMenu,
  VoltNavigationMenuContent,
  VoltNavigationMenuContentItem,
  VoltNavigationMenuItem,
  VoltNavigationMenuLink,
  VoltNavigationMenuList,
  VoltNavigationMenuTrigger,
} from './index';

@Component({
  imports: [
    VoltNavigationMenu,
    VoltNavigationMenuContent,
    VoltNavigationMenuContentItem,
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
        <volt-navigation-menu-item value="company">
          <volt-navigation-menu-trigger [content]="companyTpl">
            Company
          </volt-navigation-menu-trigger>
        </volt-navigation-menu-item>
      </volt-navigation-menu-list>
    </volt-navigation-menu>

    <ng-template #productsTpl>
      <volt-navigation-menu-content>
        <volt-navigation-menu-content-item>
          <a href="/analytics">Analytics</a>
        </volt-navigation-menu-content-item>
        <volt-navigation-menu-content-item>
          <a href="/reports">Reports</a>
        </volt-navigation-menu-content-item>
      </volt-navigation-menu-content>
    </ng-template>

    <ng-template #companyTpl>
      <volt-navigation-menu-content>
        <volt-navigation-menu-content-item>
          <a href="/about">About us</a>
        </volt-navigation-menu-content-item>
      </volt-navigation-menu-content>
    </ng-template>
  `,
})
class NavigationMenuFixture {}

const trigger = (name: RegExp) => screen.getByRole('button', { name });

describe('navigation menu components', () => {
  it('render navigation and native link semantics', async () => {
    await render(NavigationMenuFixture);

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Documentation' });
    expect(link).toHaveAttribute('href', '/docs');
    // Confirms the voltNavigationMenuLink directive actually attached (not just an
    // inert HTML attribute) — data-active is set by NgpNavigationMenuLink itself.
    expect(link).toHaveAttribute('data-active');
    expect(trigger(/Products/i)).toBeInTheDocument();
  });

  it('starts closed and exposes the submenu relationship on its trigger', async () => {
    await render(NavigationMenuFixture);

    const products = trigger(/Products/i);
    expect(products).toHaveAttribute('aria-haspopup', 'menu');
    expect(products).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Analytics' })).not.toBeInTheDocument();
  });

  it('opens a submenu from its trigger and renders the projected items', async () => {
    const user = userEvent.setup();
    await render(NavigationMenuFixture);
    const products = trigger(/Products/i);

    await user.click(products);

    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'true'));
    expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reports' })).toBeInTheDocument();
  });

  it('swaps the open submenu when another trigger is activated', async () => {
    const user = userEvent.setup();
    await render(NavigationMenuFixture);

    await user.click(trigger(/Products/i));
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    );

    await user.click(trigger(/Company/i));

    // Only one submenu may be open at a time, otherwise two panels stack on screen.
    await waitFor(() => expect(screen.getByRole('link', { name: 'About us' })).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Analytics' })).not.toBeInTheDocument();
    // The panel is torn down by the overlay, but aria-expanded is a host binding on the
    // trigger, so it only lands on the next change detection pass. Waiting for both
    // separately is what keeps this green on a slow CI runner.
    await waitFor(() => expect(trigger(/Products/i)).toHaveAttribute('aria-expanded', 'false'));
  });

  it('closes the open submenu on Escape', async () => {
    const user = userEvent.setup();
    await render(NavigationMenuFixture);
    const products = trigger(/Products/i);

    await user.click(products);
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    );

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Analytics' })).not.toBeInTheDocument()
    );
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'false'));
  });
});
