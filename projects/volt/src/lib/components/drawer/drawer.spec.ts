import { Component } from '@angular/core';
import { NgpDialogRef } from 'ng-primitives/dialog';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltDrawer } from './drawer';
import { VoltDrawerClose } from './drawer-close';
import { VoltDrawerContent } from './drawer-content';
import { VoltDrawerDescription } from './drawer-description';
import { VoltDrawerOverlay } from './drawer-overlay';
import { VoltDrawerTitle } from './drawer-title';

@Component({
  selector: 'app-drawer-test-wrapper',
  imports: [
    VoltDrawer,
    VoltDrawerClose,
    VoltDrawerContent,
    VoltDrawerDescription,
    VoltDrawerOverlay,
    VoltDrawerTitle,
  ],
  template: `
    <button [voltDrawer]="drawerTpl">Open Drawer</button>

    <ng-template #drawerTpl>
      <div voltDrawerOverlay></div>
      <div voltDrawerContent>
        <h2 voltDrawerTitle>Drawer Title</h2>
        <p voltDrawerDescription>Drawer description</p>
        <volt-drawer-close />
      </div>
    </ng-template>
  `,
})
class DrawerTestWrapper {}

describe('VoltDrawer', () => {
  it('should render a trigger with the dialog affordance', async () => {
    await render(DrawerTestWrapper);

    const trigger = screen.getByRole('button', { name: 'Open Drawer' });
    expect(trigger).toBeInTheDocument();
  });

  it('should render a keyboard reachable close control', async () => {
    await render(`<volt-drawer-close />`, {
      imports: [VoltDrawerClose],
      providers: [{ provide: NgpDialogRef, useValue: { close: () => undefined } }],
    });

    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveAttribute('tabindex', '0');
  });
});
