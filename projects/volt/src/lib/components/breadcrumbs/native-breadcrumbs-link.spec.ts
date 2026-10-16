import { Component } from '@angular/core';
import { Router, provideRouter, RouterLink, RouterLinkActive } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltBreadcrumbLink } from './breadcrumbs-link';
import { VoltNativeBreadcrumbLink } from './native-breadcrumbs-link';
import { VoltBreadcrumbPage } from './breadcrumbs-page';
import { VoltBreadcrumbs } from './breadcrumbs';

@Component({ template: 'page' })
class Page {}

@Component({
  imports: [
    VoltBreadcrumbs,
    VoltNativeBreadcrumbLink,
    VoltBreadcrumbPage,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <volt-breadcrumbs>
      <a voltBreadcrumbLink href="/docs" data-testid="plain">Docs</a>
      <a
        voltBreadcrumbLink
        routerLink="/admin"
        [queryParams]="{ tab: 'users' }"
        fragment="top"
        routerLinkActive="is-active"
        ariaCurrentWhenActive="page"
        data-testid="router"
      >
        Admin
      </a>
      <a voltBreadcrumbLink [routerLink]="['/admin', id]" data-testid="array">Item</a>
      <a voltBreadcrumbLink href="https://example.com" target="_blank" rel="noopener" class="px-3">
        External
      </a>
      <volt-breadcrumb-page>Current</volt-breadcrumb-page>
    </volt-breadcrumbs>
  `,
})
class Host {
  readonly id = 42;
}

const routes = [
  { path: 'admin', component: Page },
  { path: 'admin/:id', component: Page },
];

describe('VoltNativeBreadcrumbLink', () => {
  it('styles the anchor you wrote and keeps href, target and rel', async () => {
    await render(Host, { providers: [provideRouter(routes)] });

    const plain = screen.getByTestId('plain');
    expect(plain.tagName).toBe('A');
    expect(plain).toHaveAttribute('href', '/docs');
    expect(plain).toHaveClass('transition-colors', 'hover:text-foreground');

    const external = screen.getByRole('link', { name: 'External' });
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener');
    // A consumer class merges over the defaults rather than replacing them.
    expect(external).toHaveClass('px-3', 'transition-colors');
  });

  it('composes with RouterLink: href, query params, fragment and array commands', async () => {
    await render(Host, { providers: [provideRouter(routes)] });

    expect(screen.getByTestId('router')).toHaveAttribute('href', '/admin?tab=users#top');
    expect(screen.getByTestId('array')).toHaveAttribute('href', '/admin/42');
  });

  it('navigates without a page load and lets RouterLinkActive mark the current page', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host, { providers: [provideRouter(routes)] });
    const router = fixture.debugElement.injector.get(Router);
    const admin = screen.getByTestId('router');
    expect(admin).not.toHaveAttribute('aria-current');

    await user.click(admin);
    await fixture.whenStable();

    expect(router.url).toBe('/admin?tab=users#top');
    expect(admin).toHaveAttribute('aria-current', 'page');
    expect(admin).toHaveClass('is-active');
  });

  it('is reachable and operable by keyboard', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host, { providers: [provideRouter(routes)] });
    const router = fixture.debugElement.injector.get(Router);

    await user.tab();
    expect(screen.getByTestId('plain')).toHaveFocus();
    await user.tab();
    expect(screen.getByTestId('router')).toHaveFocus();
    await user.keyboard('{Enter}');
    await fixture.whenStable();
    expect(router.url).toContain('/admin');
  });

  it('looks identical to the wrapper component', async () => {
    @Component({
      imports: [VoltBreadcrumbLink, VoltNativeBreadcrumbLink],
      template: `
        <volt-breadcrumb-link href="/a">Wrapper</volt-breadcrumb-link>
        <a voltBreadcrumbLink href="/b">Native</a>
      `,
    })
    class Both {}

    await render(Both);

    const wrapper = screen.getByRole('link', { name: 'Wrapper' });
    const native = screen.getByRole('link', { name: 'Native' });
    expect(native.className.split(/\s+/).sort()).toEqual(wrapper.className.split(/\s+/).sort());
  });
});
