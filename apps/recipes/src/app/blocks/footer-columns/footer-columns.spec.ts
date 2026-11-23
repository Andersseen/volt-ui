import { render, screen, within } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { FooterColumns } from './footer-columns';

describe('FooterColumns', () => {
  it('is a footer with one named navigation per column', async () => {
    const { fixture } = await render(FooterColumns);

    expect((fixture.nativeElement as HTMLElement).querySelector('footer')).not.toBeNull();
    for (const name of ['Product', 'Developers', 'Company', 'Resources']) {
      expect(screen.getByRole('navigation', { name })).toBeInTheDocument();
    }
    expect(
      within(screen.getByRole('navigation', { name: 'Developers' })).getAllByRole('link')
    ).toHaveLength(5);
  });

  it('carries the same columns as an accordion for narrow containers', async () => {
    await render(FooterColumns);

    for (const name of ['Product', 'Developers', 'Company', 'Resources']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('names its icon-only links and prints the current year', async () => {
    await render(FooterColumns);

    for (const name of ['GitHub', 'Community forum', 'RSS feed']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Northwind`))).toBeTruthy();
  });
});
