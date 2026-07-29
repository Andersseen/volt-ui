import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { DocsPageShell } from './docs-page-shell';
import { Footer } from './footer';
import { Header } from './header';

describe('application shell', () => {
  it('renders the primary navigation and current release', async () => {
    await render(Header, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Volt UI/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs/introduction'
    );
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'href',
      '/docs/components'
    );
    expect(screen.getByRole('link', { name: 'Create Theme' })).toHaveAttribute(
      'href',
      '/create-theme'
    );
    expect(screen.getByText('v0.7.0')).toBeInTheDocument();
  });

  it('renders useful footer navigation and repository metadata', async () => {
    await render(Footer, { providers: [provideRouter([])] });

    expect(screen.getByText('Angular components you own.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs/introduction'
    );
    expect(screen.getByRole('link', { name: 'GitHub repository' })).toHaveAttribute(
      'href',
      'https://github.com/Andersseen/volt-ui'
    );
  });

  it('renders grouped documentation navigation with stability labels', async () => {
    await render(DocsPageShell, {
      providers: [provideRouter([])],
      componentInputs: {
        title: 'Components',
        browseLabel: 'Browse components',
        description: 'Component catalog',
        groups: [
          {
            heading: 'Forms',
            links: [
              { path: '/docs/components/input', label: 'Input', stability: 'stable' },
              { path: '/docs/components/combobox', label: 'Combobox', stability: 'beta' },
            ],
          },
        ],
      },
    });

    expect(screen.getByRole('complementary', { name: 'Components' })).toBeInTheDocument();
    expect(screen.getByText('Component catalog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inputstable/i })).toHaveAttribute(
      'href',
      '/docs/components/input'
    );
    expect(screen.getByRole('link', { name: /Comboboxbeta/i })).toHaveAttribute(
      'href',
      '/docs/components/combobox'
    );
  });
});
