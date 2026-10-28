import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltToolbar } from './toolbar';
import { VoltToolbarButton } from './toolbar-button';

@Component({
  selector: 'app-toolbar-test-wrapper',
  imports: [VoltToolbar, VoltToolbarButton],
  template: `<volt-toolbar [orientation]="orientation()"
    ><button voltToolbarButton>Cut</button><button voltToolbarButton>Copy</button></volt-toolbar
  >`,
})
class ToolbarTestWrapper {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}

describe('VoltToolbar', () => {
  it('should render toolbar with horizontal orientation by default', async () => {
    const { container } = await render(ToolbarTestWrapper);

    const toolbar = container.querySelector('volt-toolbar');
    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should apply vertical orientation', async () => {
    const { container } = await render(ToolbarTestWrapper, {
      componentInputs: { orientation: 'vertical' },
    });

    const toolbar = container.querySelector('volt-toolbar');
    expect(toolbar).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should move focus between toolbar buttons with arrow keys', async () => {
    const user = userEvent.setup();
    const { getByRole } = await render(ToolbarTestWrapper);

    const cut = getByRole('button', { name: 'Cut' });
    const copy = getByRole('button', { name: 'Copy' });

    cut.focus();
    await user.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(copy);
  });
});
