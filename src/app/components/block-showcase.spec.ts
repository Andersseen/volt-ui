import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BlockShowcase } from './block-showcase';
import { blockBySlug } from '../lib/blocks-metadata';

@Component({
  imports: [BlockShowcase],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <p data-testid="projected">the live block</p>
    </app-block-showcase>
  `,
})
class Host {
  readonly block = blockBySlug('hero');
  readonly code = 'export class HeroSpotlight {}';
}

const renderHost = () => render(Host, { providers: [provideRouter([])] });

describe('BlockShowcase', () => {
  it('titles the page after the block and projects the live section', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { level: 1, name: 'Hero Spotlight' })).toBeInTheDocument();
    expect(screen.getByTestId('projected')).toBeInTheDocument();
  });

  it('explains what moves, rather than leaving the visitor to hover and guess', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { name: /what moves/i })).toBeInTheDocument();
    expect(screen.getByText(blockBySlug('hero').motion)).toBeInTheDocument();
  });

  it('links every atom back to its own component page', async () => {
    await renderHost();
    const block = blockBySlug('hero');

    for (const atom of block.atoms) {
      expect(screen.getByRole('link', { name: atom.name })).toHaveAttribute('href', atom.path);
    }
  });

  it('offers the source with a copy button', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { name: /block source/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });
});
