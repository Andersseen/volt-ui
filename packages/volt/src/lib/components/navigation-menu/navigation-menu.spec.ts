import { Component, signal } from '@angular/core';
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

// waitFor's default 1s is too tight when ~100 spec files run in parallel under coverage on a CI runner.
const SLOW = { timeout: 5000 };

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
    await waitFor(
      () => expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument(),
      SLOW
    );

    // The content is in the DOM before the trigger's own open state has settled; on a slow runner
    // an Escape sent in that gap is ignored (the primitive only handles it while `open`). Wait for
    // the state a user would see, not just the markup.
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'true'), SLOW);
    await user.keyboard('{Escape}');

    await waitFor(
      () => expect(screen.queryByRole('link', { name: 'Analytics' })).not.toBeInTheDocument(),
      SLOW
    );
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'false'), SLOW);
  });
});

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
    <volt-navigation-menu aria-label="Site" [variant]="variant()" [layout]="layout()">
      <volt-navigation-menu-list>
        <volt-navigation-menu-item>
          <a voltNavigationMenuLink href="/home">Home</a>
        </volt-navigation-menu-item>
        <volt-navigation-menu-item>
          <a voltNavigationMenuLink [active]="current() === 'docs'" href="/docs">Docs</a>
        </volt-navigation-menu-item>
        <volt-navigation-menu-item>
          <a voltNavigationMenuLink disabled href="/beta">Beta</a>
        </volt-navigation-menu-item>
        <volt-navigation-menu-item>
          <volt-navigation-menu-trigger [content]="moreTpl">More</volt-navigation-menu-trigger>
        </volt-navigation-menu-item>
        <volt-navigation-menu-item>
          <volt-navigation-menu-trigger disabled [content]="moreTpl"
            >Locked</volt-navigation-menu-trigger
          >
        </volt-navigation-menu-item>
      </volt-navigation-menu-list>
    </volt-navigation-menu>
    <ng-template #moreTpl>
      <volt-navigation-menu-content>
        <volt-navigation-menu-content-item
          ><a href="/blog">Blog</a></volt-navigation-menu-content-item
        >
      </volt-navigation-menu-content>
    </ng-template>
  `,
})
class VariantMenuFixture {
  readonly variant = signal<'subtle' | 'pill' | 'underline' | 'outline'>('subtle');
  readonly layout = signal<'inline' | 'contained'>('inline');
  readonly current = signal('docs');
}

describe('navigation menu presentation', () => {
  it('defaults to the subtle variant and the inline layout', async () => {
    await render(VariantMenuFixture);
    const nav = screen.getByRole('navigation', { name: 'Site' });
    expect(nav).toHaveAttribute('data-variant', 'subtle');
    expect(nav).toHaveAttribute('data-layout', 'inline');
  });

  it('reflects a variant and layout change on the menu and restyles its links and triggers', async () => {
    const { fixture } = await render(VariantMenuFixture);
    const docs = screen.getByRole('link', { name: 'Docs' });
    const more = screen.getByRole('button', { name: /More/ });
    const before = { link: docs.className, trigger: more.className };

    fixture.componentInstance.variant.set('pill');
    fixture.componentInstance.layout.set('contained');
    fixture.detectChanges();
    await fixture.whenStable();

    const nav = screen.getByRole('navigation', { name: 'Site' });
    expect(nav).toHaveAttribute('data-variant', 'pill');
    expect(nav).toHaveAttribute('data-layout', 'contained');
    // The exact look is proven with computed styles in e2e/contracts; here: the menu-level
    // setting reaches both kinds of item, so a link and a trigger never disagree.
    expect(docs.className).not.toBe(before.link);
    expect(more.className).not.toBe(before.trigger);
  });

  it('marks only the current destination, and moves the mark when it changes', async () => {
    const { fixture } = await render(VariantMenuFixture);
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');

    fixture.componentInstance.current.set('elsewhere');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(screen.getByRole('link', { name: 'Docs' })).not.toHaveAttribute('aria-current');
  });

  it('an open submenu is not a destination: its trigger is expanded, never current', async () => {
    const user = userEvent.setup();
    await render(VariantMenuFixture);
    const more = screen.getByRole('button', { name: /More/ });

    await user.click(more);

    await waitFor(() => expect(more).toHaveAttribute('aria-expanded', 'true'), SLOW);
    expect(more).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page');
  });

  it('a disabled link is announced as disabled and does not navigate', async () => {
    const user = userEvent.setup();
    await render(VariantMenuFixture);
    const beta = screen.getByRole('link', { name: 'Beta' });
    expect(beta).toHaveAttribute('aria-disabled', 'true');

    // jsdom has no layout, so pointer-events: none cannot stop the click here; the primitive's
    // own listener must — it cancels the navigation (registered before this one, so seen here).
    let navigated: boolean | undefined;
    beta.addEventListener('click', event => (navigated = !event.defaultPrevented));
    await user.click(beta, { pointerEventsCheck: 0 });
    expect(navigated).toBe(false);
  });

  it('a disabled trigger is announced as disabled and does not open', async () => {
    const user = userEvent.setup();
    await render(VariantMenuFixture);
    const locked = screen.getByRole('button', { name: /Locked/ });
    expect(locked).toHaveAttribute('aria-disabled', 'true');

    locked.focus();
    await user.keyboard('{Enter}');
    await user.click(locked, { pointerEventsCheck: 0 });

    expect(locked).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument();
  });
});
