import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltBreadcrumbs } from './breadcrumbs';

@Component({
  selector: 'app-breadcrumbs-test-wrapper',
  imports: [VoltBreadcrumbs],
  template: `
    <volt-breadcrumbs>
      <a href="/">Home</a>
      <a href="/docs">Docs</a>
      <span>Breadcrumbs</span>
    </volt-breadcrumbs>
  `,
})
class BreadcrumbsTestWrapper {}

describe('VoltBreadcrumbs', () => {
  it('should render breadcrumbs nav with aria-label', async () => {
    const { container } = await render(BreadcrumbsTestWrapper);

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
  });

  it('takes a translated landmark name', async () => {
    await render(`<volt-breadcrumbs ariaLabel="Ruta de navegación"></volt-breadcrumbs>`, {
      imports: [VoltBreadcrumbs],
    });

    expect(screen.getByRole('navigation', { name: 'Ruta de navegación' })).toBeInTheDocument();
  });
});
