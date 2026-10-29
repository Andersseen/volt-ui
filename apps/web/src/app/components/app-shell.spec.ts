import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { DocsPageShell } from './docs-page-shell';
import { Footer } from './footer';
import { Header } from './header';
import { SITE_STATS } from '../lib/generated/site-stats';

describe('application shell', () => {
  it('renders the primary navigation and current release', async () => {
    await render(Header, { providers: [provideRouter([])] });

    const mainNavigation = screen.getByRole('navigation', { name: 'Main' });
    expect(mainNavigation.querySelector('[role="menubar"]')).toBeNull();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
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
    // Blocks, layouts and recipes are their own site now: the landing and the footer link to it,
    // the primary navigation stays about the library.
    expect(screen.queryByRole('link', { name: /Gallery|Recipes/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Layouts' })).not.toBeInTheDocument();
    expect(screen.getByText(`v${SITE_STATS.version}`)).toBeInTheDocument();
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
    expect(screen.getByRole('link', { name: /Recipes/ })).toHaveAttribute(
      'href',
      'https://recipes.voltui.dev/'
    );
  });

  it('renders grouped documentation navigation, badging only non-stable entries', async () => {
    await render(DocsPageShell, {
      providers: [provideRouter([])],
      componentInputs: {
        title: 'Components',
        browseLabel: 'Browse components',
        description: 'Component catalog',
        groups: [
          {
            headingKey: 'catalog.groups.forms',
            links: [
              {
                path: '/docs/components/input',
                labelKey: 'catalog.input.label',
                stability: 'stable',
              },
              {
                path: '/docs/components/combobox',
                labelKey: 'components.combobox.title',
                stability: 'beta',
              },
            ],
          },
        ],
      },
    });

    expect(screen.getByRole('complementary', { name: 'Components' })).toBeInTheDocument();
    expect(screen.getByText('Component catalog')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Input' })[0]).toHaveAttribute(
      'href',
      '/docs/components/input'
    );
    expect(screen.getByRole('link', { name: /Comboboxbeta/i })).toHaveAttribute(
      'href',
      '/docs/components/combobox'
    );
  });
});
