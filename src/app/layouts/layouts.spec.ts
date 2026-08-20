import { render } from '@testing-library/angular';
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
