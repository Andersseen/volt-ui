import { Component } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltDrawer } from './drawer';
import { VoltDrawerContent } from './drawer-content';
import { VoltDrawerDescription } from './drawer-description';
import { VoltDrawerOverlay } from './drawer-overlay';
import { VoltDrawerTitle } from './drawer-title';

@Component({
  selector: 'app-drawer-test-wrapper',
  imports: [
    VoltDrawer,
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
});
