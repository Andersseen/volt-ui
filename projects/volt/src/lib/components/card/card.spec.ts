import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import {
  VoltCard,
  VoltCardHeader,
  VoltCardTitle,
  VoltCardDescription,
  VoltCardContent,
  VoltCardFooter,
} from './card';

@Component({
  selector: 'app-card-test-wrapper',
  imports: [
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
  ],
  template: `
    <volt-card>
      <volt-card-header>
        <volt-card-title>Card Title</volt-card-title>
        <volt-card-description>Card description</volt-card-description>
      </volt-card-header>
      <volt-card-content>Card content</volt-card-content>
      <volt-card-footer>Card footer</volt-card-footer>
    </volt-card>
  `,
})
class CardTestWrapper {}

describe('VoltCard', () => {
  it('should render card with all sections', async () => {
    await render(CardTestWrapper);

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Card footer')).toBeInTheDocument();
  });

  it('should apply card surface classes', async () => {
    const { container } = await render(CardTestWrapper);

    const card = container.querySelector('volt-card');
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-surface');
  });
});
