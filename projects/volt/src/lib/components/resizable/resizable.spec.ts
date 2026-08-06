import { Component, signal } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { VoltResizable, VoltResizableHandle, VoltResizablePanel } from './index';

@Component({
  imports: [VoltResizable, VoltResizableHandle, VoltResizablePanel],
  template: `
    <volt-resizable [orientation]="orientation()" class="custom-group">
      <volt-resizable-panel>First</volt-resizable-panel>
      <volt-resizable-handle aria-label="Resize panels" (resizingChange)="resizingChange($event)" />
      <volt-resizable-panel>Second</volt-resizable-panel>
    </volt-resizable>
  `,
})
class ResizableFixture {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  resizingChange = vi.fn();
}

describe('resizable components', () => {
  it('render panels and an accessible separator handle', async () => {
    const { container } = await render(ResizableFixture);

    const group = container.querySelector('volt-resizable');
    const handle = screen.getByRole('separator', { name: 'Resize panels' });
    expect(group).toHaveClass('flex-row', 'custom-group');
    expect(handle).toHaveAttribute('tabindex', '0');
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    expect(handle).toHaveAttribute('aria-valuemin', '0');
    expect(handle).toHaveAttribute('aria-valuemax', '100');
    expect(handle).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  it('resizes a horizontal group with the left/right arrow keys', async () => {
    const { container, fixture } = await render(ResizableFixture);
    const handle = screen.getByRole('separator', { name: 'Resize panels' });
    const firstPanel = container.querySelector('volt-resizable-panel');

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(firstPanel).toHaveStyle({ width: '60px' });
    expect(handle).toHaveAttribute('aria-valuenow', '60');

    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    await fixture.whenStable();
    expect(firstPanel).toHaveStyle({ width: '50px' });
    expect(handle).toHaveAttribute('aria-valuenow', '50');

    // Cross-axis keys must stay inert, so arrow-key scrolling still works.
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await fixture.whenStable();
    expect(handle).toHaveAttribute('aria-valuenow', '50');
  });

  it('inherits its axis from the enclosing group', async () => {
    const { container, fixture } = await render(ResizableFixture);
    const handle = screen.getByRole('separator', { name: 'Resize panels' });
    const group = container.querySelector('volt-resizable');

    // No `orientation` is set on the handle itself — the group's value has to win,
    // otherwise the handle resizes the wrong dimension inside a vertical group.
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();

    expect(group).toHaveClass('flex-col');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveClass('h-1', 'w-full', 'cursor-row-resize');
    expect(handle).not.toHaveClass('cursor-col-resize');
  });

  it('resizes a vertical group with the up/down arrow keys', async () => {
    const { container, fixture } = await render(ResizableFixture);
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();

    const handle = screen.getByRole('separator', { name: 'Resize panels' });
    const firstPanel = container.querySelector('volt-resizable-panel');

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await fixture.whenStable();
    expect(firstPanel).toHaveStyle({ height: '60px' });
    expect(handle).toHaveAttribute('aria-valuenow', '60');

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    await fixture.whenStable();
    expect(firstPanel).toHaveStyle({ height: '50px' });

    // The horizontal keys must be inert once the group is vertical.
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(handle).toHaveAttribute('aria-valuenow', '50');
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

  it('tracks the pointer on the vertical axis in a vertical group', async () => {
    const { container, fixture } = await render(ResizableFixture);
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();

    const handle = screen.getByRole('separator', { name: 'Resize panels' });
    const firstPanel = container.querySelector('volt-resizable-panel');

    // Movement on the X axis alone must not resize a vertical group.
    fireEvent.pointerDown(handle, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(document, { clientX: 90, clientY: 10, pointerId: 1 });
    expect(firstPanel).toHaveStyle({ height: '50px' });

    fireEvent.pointerMove(document, { clientX: 90, clientY: 30, pointerId: 1 });
    fireEvent.pointerUp(document, { pointerId: 1 });

    expect(firstPanel).toHaveStyle({ height: '70px' });
    expect(handle).toHaveAttribute('aria-valuenow', '70');
  });

  it('emits resizingChange on pointer down and up', async () => {
    const { fixture } = await render(ResizableFixture);
    const handle = screen.getByRole('separator', { name: 'Resize panels' });

    fireEvent.pointerDown(handle, { clientX: 10, pointerId: 1 });
    expect(fixture.componentInstance.resizingChange).toHaveBeenCalledWith(true);

    fireEvent.pointerUp(document, { pointerId: 1 });
    expect(fixture.componentInstance.resizingChange).toHaveBeenCalledWith(false);
  });
});
