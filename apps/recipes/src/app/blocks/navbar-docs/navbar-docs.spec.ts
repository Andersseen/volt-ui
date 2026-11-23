import { render, screen, within } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { NavbarDocs } from './navbar-docs';

describe('NavbarDocs', () => {
  it('marks the current section and names both navigations', async () => {
    await render(NavbarDocs);

    const sections = screen.getByRole('navigation', { name: 'Sections' });
    expect(within(sections).getByRole('link', { name: 'Components' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(sections).getByRole('link', { name: 'Guides' })).not.toHaveAttribute(
      'aria-current'
    );
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('labels its search, version picker and icon-only source link', async () => {
    await render(NavbarDocs);

    expect(screen.getByRole('searchbox', { name: 'Search the docs' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Documentation version' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Source on GitHub' })).toHaveAttribute(
      'rel',
      'noopener'
    );
  });
});
