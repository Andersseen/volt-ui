import { render, screen, within } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { VoltSidebarService } from 'volt';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import type { Type } from '@angular/core';
import { AdminDashboardLayout } from './admin-dashboard/admin-dashboard';
import { AnalyticsLayout } from './analytics/analytics';
import { ChatLayout } from './chat/chat';
import { KanbanLayout } from './kanban/kanban';
import { LoginLayout } from './login/login';
import { ProfileLayout } from './profile/profile';
import { SettingsLayout } from './settings/settings';
import { SignUpLayout } from './sign-up/sign-up';
import { TopNavLayout } from './top-nav/top-nav';

const LAYOUTS: readonly [string, Type<unknown>][] = [
  ['admin dashboard', AdminDashboardLayout],
  ['top nav', TopNavLayout],
  ['analytics', AnalyticsLayout],
  ['settings', SettingsLayout],
  ['profile', ProfileLayout],
  ['kanban', KanbanLayout],
  ['chat', ChatLayout],
  ['login', LoginLayout],
  ['sign up', SignUpLayout],
];

const renderLayout = (component: Type<unknown>) =>
  render(component, { providers: [provideRouter([])] });

describe('layouts', () => {
  it.each(LAYOUTS)('renders the %s layout', async (_name, component) => {
    const { fixture } = await renderLayout(component);

    expect((fixture.nativeElement as HTMLElement).children.length).toBeGreaterThan(0);
  });

  /*
   * The rule that separates a layout from a block. A skeleton that reaches out to an
   * avatar service or a CDN the moment it renders hands every project that copies it a
   * network dependency and a third-party request it never asked for.
   */
  it.each(LAYOUTS)('ships the %s layout without any external asset', async (_name, component) => {
    const { fixture } = await renderLayout(component);
    const html = (fixture.nativeElement as HTMLElement).innerHTML;

    expect(html).not.toMatch(/src="https?:/);
    expect(html).not.toContain('pravatar');
  });

  it.each(LAYOUTS)('gives the %s layout a heading to orient by', async (_name, component) => {
    const { fixture } = await renderLayout(component);
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1, h2')).not.toBeNull();
  });
});

/**
 * Accessible-name audit shared by every layout: a control a screen reader announces as just
 * "button" or "link" is a defect, and icon-only controls are where it happens.
 */
const nameOf = (el: HTMLElement): string =>
  (
    el.getAttribute('aria-label') ??
    (el.getAttribute('aria-labelledby')
      ? (el.ownerDocument.getElementById(el.getAttribute('aria-labelledby')!)?.textContent ?? '')
      : '') ??
    ''
  ).trim() ||
  (el.textContent ?? '').trim() ||
  [...((el as HTMLButtonElement).labels ?? [])]
    .map(l => l.textContent ?? '')
    .join(' ')
    .trim() ||
  (el.getAttribute('title') ?? '').trim() ||
  (el.querySelector('img[alt]')?.getAttribute('alt') ?? '').trim();

describe('layout accessibility', () => {
  it.each(LAYOUTS)('names every button and link in the %s layout', async (_name, component) => {
    const { fixture } = await renderLayout(component);
    const unnamed = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'button, a[href], [role="button"]'
      ),
    ].filter(el => !nameOf(el));

    expect(unnamed.map(el => el.outerHTML.slice(0, 120))).toEqual([]);
  });
});

describe('admin dashboard layout', () => {
  it('gives the mobile navigation trigger a name and exposes its state', async () => {
    await renderLayout(AdminDashboardLayout);
    const trigger = screen.getByRole('button', { name: 'Open navigation' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('has one page heading, a labelled breadcrumb trail and a keyboard-scrollable table', async () => {
    await renderLayout(AdminDashboardLayout);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    const region = screen.getByRole('region', { name: 'Recent orders' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.querySelector('[role="table"], table')).not.toBeNull();
  });

  it('keeps link names when the sidebar collapses to icons', async () => {
    const { fixture } = await renderLayout(AdminDashboardLayout);
    TestBed.inject(VoltSidebarService).setCollapsed(true);
    await fixture.whenStable();

    for (const name of ['Dashboard', 'Analytics', 'Customers', 'Messages', 'Settings']) {
      expect(
        within(screen.getByRole('complementary')).getByRole('link', { name })
      ).toBeInTheDocument();
    }
  });
});
