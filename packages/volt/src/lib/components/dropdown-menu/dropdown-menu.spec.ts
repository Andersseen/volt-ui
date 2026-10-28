import { Component } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltDropdownMenu } from './dropdown-menu';
import { VoltDropdownMenuItem } from './dropdown-menu-item';
import { VoltDropdownMenuSubmenuTrigger } from './dropdown-menu-submenu-trigger';
import { VoltDropdownMenuTrigger } from './dropdown-menu-trigger';

@Component({
  selector: 'app-dropdown-menu-test-wrapper',
  imports: [
    VoltDropdownMenuTrigger,
    VoltDropdownMenu,
    VoltDropdownMenuItem,
    VoltDropdownMenuSubmenuTrigger,
  ],
  template: `
    <button type="button" [voltDropdownMenu]="menuTpl">Open menu</button>

    <ng-template #menuTpl>
      <volt-dropdown-menu>
        <volt-dropdown-menu-item>Profile</volt-dropdown-menu-item>
        <volt-dropdown-menu-submenu-trigger [submenu]="submenuTpl">
          More
        </volt-dropdown-menu-submenu-trigger>
        <volt-dropdown-menu-item>Settings</volt-dropdown-menu-item>
      </volt-dropdown-menu>
    </ng-template>

    <ng-template #submenuTpl>
      <volt-dropdown-menu>
        <volt-dropdown-menu-item>Billing</volt-dropdown-menu-item>
      </volt-dropdown-menu>
    </ng-template>
  `,
})
class DropdownMenuTestWrapper {}

@Component({
  selector: 'app-dropdown-menu-disabled-wrapper',
  imports: [VoltDropdownMenuTrigger, VoltDropdownMenu, VoltDropdownMenuItem],
  template: `
    <button type="button" [voltDropdownMenu]="menuTpl">Open menu</button>

    <ng-template #menuTpl>
      <volt-dropdown-menu>
        <volt-dropdown-menu-item [disabled]="true" (click)="onDelete()">
          Delete
        </volt-dropdown-menu-item>
      </volt-dropdown-menu>
    </ng-template>
  `,
})
class DropdownMenuDisabledWrapper {
  activated = false;
  onDelete(): void {
    this.activated = true;
  }
}

describe('VoltDropdownMenu', () => {
  it('should render menu and menuitem roles', async () => {
    const user = userEvent.setup();
    await render(DropdownMenuTestWrapper);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'More' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
  });

  it('should mark a disabled item unavailable and not activate it via keyboard', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(DropdownMenuDisabledWrapper);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await fixture.whenStable();
    const item = screen.getByRole('menuitem', { name: 'Delete' });

    expect(item).toHaveAttribute('data-disabled');

    item.focus();
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.activated).toBe(false);

    await user.keyboard(' ');
    expect(fixture.componentInstance.activated).toBe(false);
  });
});
