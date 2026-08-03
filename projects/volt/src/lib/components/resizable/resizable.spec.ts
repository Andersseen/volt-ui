import { Component, signal } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { VoltResizable, VoltResizableHandle, VoltResizablePanel } from './index';

@Component({
  imports: [VoltResizable, VoltResizableHandle, VoltResizablePanel],
  template: `
    <volt-resizable [orientation]="orientation()" class="custom-group">
      <volt-resizable-panel>First</volt-resizable-panel>
      <volt-resizable-handle aria-label="Resize panels" />
      <volt-resizable-panel>Second</volt-resizable-panel>
    </volt-resizable>
  `,
})
class ResizableFixture {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
}

describe('resizable components', () => {
  it('render panels and an accessible separator handle', async () => {
    const { container, fixture } = await render(ResizableFixture);

    const group = container.querySelector('volt-resizable');
    const handle = screen.getByRole('separator', { name: 'Resize panels' });
    expect(group).toHaveClass('flex-row', 'custom-group');
    expect(handle).toHaveAttribute('tabindex', '0');
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    expect(handle).toHaveAttribute('aria-valuemax', '100');
    expect(handle).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('First')).toBeInTheDocument();

    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();
    expect(group).toHaveClass('flex-col');

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle).toBeInTheDocument();

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    fixture.detectChanges();
    expect(handle).toHaveAttribute('aria-valuenow', '70');
  });

  it('should resize with pointer events', async () => {
    const { container } = await render(ResizableFixture);

    const handle = screen.getByRole('separator', { name: 'Resize panels' });
    const firstPanel = container.querySelector('volt-resizable-panel');
    fireEvent.pointerDown(handle, { clientX: 10, pointerId: 1 });
    fireEvent.pointerMove(document, { clientX: 30, pointerId: 1 });
    fireEvent.pointerUp(document, { pointerId: 1 });

    expect(firstPanel).toHaveStyle({ width: '70px' });
    expect(handle).toHaveAttribute('aria-valuenow', '70');
  });
});
