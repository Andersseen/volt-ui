import { Component, signal } from '@angular/core';
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

@Component({
  imports: [VoltSidebar, VoltSidebarContent, VoltSidebarGroup, VoltSidebarItem],
  template: `
    <volt-sidebar [width]="width()" [collapsedWidth]="collapsedWidth()">
      <volt-sidebar-content>
        <volt-sidebar-group label="Main">
          <volt-sidebar-item routerLink="/home" label="Home">
            <span slot="icon" data-testid="icon">icon</span>
            <span slot="trailing" data-testid="trailing">3</span>
          </volt-sidebar-item>
        </volt-sidebar-group>
      </volt-sidebar-content>
    </volt-sidebar>
  `,
})
class SidebarSlotsFixture {
  readonly width = signal<string | undefined>(undefined);
  readonly collapsedWidth = signal<string | undefined>(undefined);
}

describe('sidebar layout', () => {
  it('render its landmark and close the mobile drawer from the backdrop and Escape', async () => {
    const { fixture } = await render(SidebarFixture, {
      providers: [provideRouter([])],
    });
    const service = TestBed.inject(VoltSidebarService);

    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
    expect(screen.getByText('Main')).toBeInTheDocument();

    service.setMobileOpen(true);
    await fixture.whenStable();
    const backdrop = fixture.nativeElement.querySelector('[aria-label="Close sidebar"]');
    fireEvent.click(backdrop);
    expect(service.isMobileOpen()).toBe(false);

    service.setMobileOpen(true);
    await fixture.whenStable();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(service.isMobileOpen()).toBe(false);
  });

  it('keep the projected icon in the DOM across every collapse toggle', async () => {
    const { fixture } = await render(SidebarSlotsFixture, {
      providers: [provideRouter([])],
    });
    const service = TestBed.inject(VoltSidebarService);

    service.setCollapsed(false);
    await fixture.whenStable();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('trailing')).toBeInTheDocument();

    service.setCollapsed(true);
    await fixture.whenStable();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByTestId('trailing')).not.toBeInTheDocument();

    service.setCollapsed(false);
    await fixture.whenStable();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('trailing')).toBeInTheDocument();

    // A single anchor renders both modes, so the routing bindings cannot drift apart.
    expect(fixture.nativeElement.querySelectorAll('volt-sidebar-item a')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Home/ })).toHaveAttribute('href', '/home');
  });

  it('resolve the sidebar width from the inputs and fall back to the custom property', async () => {
    const { fixture } = await render(SidebarSlotsFixture, {
      providers: [provideRouter([])],
    });
    const service = TestBed.inject(VoltSidebarService);
    const aside = (): HTMLElement => fixture.nativeElement.querySelector('aside');

    service.setCollapsed(false);
    await fixture.whenStable();
    expect(aside().style.width).toContain('var(--volt-sidebar-width');

    service.setCollapsed(true);
    await fixture.whenStable();
    expect(aside().style.width).toContain('var(--volt-sidebar-collapsed-width');

    fixture.componentInstance.width.set('20rem');
    fixture.componentInstance.collapsedWidth.set('72px');
    await fixture.whenStable();
    expect(aside().style.width).toBe('72px');

    service.setCollapsed(false);
    await fixture.whenStable();
    expect(aside().style.width).toBe('20rem');
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
