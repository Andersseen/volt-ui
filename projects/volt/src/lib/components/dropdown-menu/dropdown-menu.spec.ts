import { Component } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltDropdownMenu } from './dropdown-menu';
import { VoltDropdownMenuItem } from './dropdown-menu-item';
import { VoltDropdownMenuTrigger } from './dropdown-menu-trigger';

@Component({
  selector: 'app-dropdown-menu-test-wrapper',
  imports: [VoltDropdownMenuTrigger, VoltDropdownMenu, VoltDropdownMenuItem],
  template: `
    <button type="button" [voltDropdownMenu]="menuTpl">Open menu</button>

    <ng-template #menuTpl>
      <volt-dropdown-menu>
        <volt-dropdown-menu-item>Profile</volt-dropdown-menu-item>
        <volt-dropdown-menu-item>Settings</volt-dropdown-menu-item>
      </volt-dropdown-menu>
    </ng-template>
  `,
})
class DropdownMenuTestWrapper {}

describe('VoltDropdownMenu', () => {
  it('should render menu and menuitem roles', async () => {
    const user = userEvent.setup();
    await render(DropdownMenuTestWrapper);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
  });
});
