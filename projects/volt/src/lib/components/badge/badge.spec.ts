import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltBadge } from './badge';

@Component({
  selector: 'app-badge-test-wrapper',
  imports: [VoltBadge],
  template: `<volt-badge [variant]="variant()">Beta</volt-badge>`,
})
class BadgeTestWrapper {
  readonly variant = input<'solid' | 'secondary' | 'outline' | 'destructive'>('solid');
}

describe('VoltBadge', () => {
  it('should render badge text', async () => {
    await render(BadgeTestWrapper);

    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('should apply solid variant classes by default', async () => {
    const { container } = await render(BadgeTestWrapper);

    const badge = container.querySelector('volt-badge');
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
  });

  it('should apply secondary variant classes', async () => {
    const { container } = await render(BadgeTestWrapper, {
      componentInputs: { variant: 'secondary' },
    });

    const badge = container.querySelector('volt-badge');
    expect(badge).toHaveClass('bg-muted');
  });

  it('should apply destructive variant classes', async () => {
    const { container } = await render(BadgeTestWrapper, {
      componentInputs: { variant: 'destructive' },
    });

    const badge = container.querySelector('volt-badge');
    expect(badge).toHaveClass('bg-destructive');
  });
});
