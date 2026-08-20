import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { LayoutShowcase } from './layout-showcase';
import { layoutBySlug } from '../lib/layouts-metadata';

@Component({
  imports: [LayoutShowcase],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <p data-testid="projected">the live layout</p>
    </app-layout-showcase>
  `,
})
class Host {
  readonly layout = layoutBySlug('admin-dashboard');
  readonly code = 'export class AdminDashboardLayout {}';
}

const renderHost = () => render(Host, { providers: [provideRouter([])] });

describe('LayoutShowcase', () => {
  it('titles the page after the layout and projects the live skeleton', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { level: 1, name: 'Admin Dashboard' })).toBeInTheDocument();
    expect(screen.getByTestId('projected')).toBeInTheDocument();
  });

  it('leads with the arrangement, which is what a layout is chosen by', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { name: /the arrangement/i })).toBeInTheDocument();
    expect(screen.getByText(layoutBySlug('admin-dashboard').structure)).toBeInTheDocument();
  });

  it('links every component the layout is assembled from', async () => {
    await renderHost();

    for (const atom of layoutBySlug('admin-dashboard').atoms) {
      expect(screen.getByRole('link', { name: atom.name })).toHaveAttribute('href', atom.path);
    }
  });

  it('offers the source, so a layout is something you can actually take', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { name: /layout source/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('points at the blocks gallery for anyone who wanted a finished section', async () => {
    await renderHost();

    expect(screen.getByRole('link', { name: /blocks gallery/i })).toHaveAttribute(
      'href',
      '/docs/blocks'
    );
  });
});
