import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import {
  VoltSidebar,
  VoltSidebarContent,
  VoltSidebarFooter,
  VoltSidebarGroup,
  VoltSidebarHeader,
  VoltSidebarItem,
  VoltSidebarService,
} from './index';

@Component({
  imports: [
    VoltSidebar,
    VoltSidebarContent,
    VoltSidebarFooter,
    VoltSidebarGroup,
    VoltSidebarHeader,
    VoltSidebarItem,
  ],
  template: `
    <volt-sidebar>
      <volt-sidebar-header>Brand</volt-sidebar-header>
      <volt-sidebar-content>
        <volt-sidebar-group label="Main">
          <volt-sidebar-item routerLink="/home" label="Home" />
        </volt-sidebar-group>
      </volt-sidebar-content>
      <volt-sidebar-footer>Account</volt-sidebar-footer>
    </volt-sidebar>
  `,
})
class SidebarFixture {}

describe('sidebar layout', () => {
  it('render its landmark and close the mobile drawer from the backdrop', async () => {
    const { fixture } = await render(SidebarFixture, {
      providers: [provideRouter([])],
    });
    const service = TestBed.inject(VoltSidebarService);

    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
    expect(screen.getByText('Main')).toBeInTheDocument();

    service.setMobileOpen(true);
    await fixture.whenStable();
    const backdrop = screen.getByRole('button', { name: 'Close sidebar', hidden: true });
    fireEvent.click(backdrop);
    expect(service.isMobileOpen()).toBe(false);
  });

  it('toggle and explicitly set desktop and mobile state', () => {
    const service = TestBed.inject(VoltSidebarService);

    service.setCollapsed(false);
    service.toggleCollapse();
    expect(service.isCollapsed()).toBe(true);

    service.setMobileOpen(false);
    service.toggleMobile();
    expect(service.isMobileOpen()).toBe(true);
  });
});
