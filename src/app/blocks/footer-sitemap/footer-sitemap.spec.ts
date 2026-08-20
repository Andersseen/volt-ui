import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { FooterSitemap } from './footer-sitemap';

describe('FooterSitemap', () => {
  it('is a footer landmark with a named navigation inside it', async () => {
    const { fixture } = await render(FooterSitemap);

    expect((fixture.nativeElement as HTMLElement).querySelector('footer')).not.toBeNull();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
  });

  it('groups the sitemap under headings rather than one long list', async () => {
    await render(FooterSitemap);

    for (const heading of ['Product', 'Developers', 'Company', 'Legal']) {
      expect(screen.getByRole('heading', { level: 3, name: heading })).toBeInTheDocument();
    }
  });

  it('confirms a subscription in place, without navigating', async () => {
    const { fixture } = await render(FooterSitemap);
    const host = fixture.nativeElement as HTMLElement;

    const submitted = new Event('submit', { bubbles: true, cancelable: true });
    host.querySelector('form')!.dispatchEvent(submitted);
    await fixture.whenStable();

    expect(submitted.defaultPrevented).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent(/check your inbox/i);
  });

  it('labels the newsletter field and the icon-only submit', async () => {
    await render(FooterSitemap);

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
  });

  it('shows the current year, so the footer cannot go stale', async () => {
    await render(FooterSitemap);

    expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});
