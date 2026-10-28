import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltSeparator } from './separator';

@Component({
  selector: 'app-separator-test-wrapper',
  imports: [VoltSeparator],
  template: `<volt-separator [orientation]="orientation()" />`,
})
class SeparatorTestWrapper {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}

describe('VoltSeparator', () => {
  it('should render a horizontal separator by default', async () => {
    const { container } = await render(SeparatorTestWrapper);

    const separator = container.querySelector('volt-separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-px');
    expect(separator).toHaveClass('w-full');
  });

  it('should render a vertical separator', async () => {
    const { container } = await render(SeparatorTestWrapper, {
      componentInputs: { orientation: 'vertical' },
    });

    const separator = container.querySelector('volt-separator');
    expect(separator).toHaveClass('w-px');
    expect(separator).toHaveClass('h-full');
  });
});
