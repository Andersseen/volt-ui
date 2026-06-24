import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltToolbar } from './toolbar';

@Component({
  selector: 'app-toolbar-test-wrapper',
  imports: [VoltToolbar],
  template: `<volt-toolbar [orientation]="orientation()"
    ><button>Cut</button><button>Copy</button></volt-toolbar
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
});
