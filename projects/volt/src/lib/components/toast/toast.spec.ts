import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltToastClose } from './toast-close';

describe('VoltToastClose', () => {
  it('should render an accessible keyboard-reachable close control', async () => {
    await render(`<volt-toast-close />`, {
      imports: [VoltToastClose],
    });

    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveAttribute('tabindex', '0');
  });
});
