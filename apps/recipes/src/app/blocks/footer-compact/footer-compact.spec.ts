import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { FooterCompact } from './footer-compact';

describe('FooterCompact', () => {
  it('is a footer landmark with the ownership line and the current year', async () => {
    const { fixture } = await render(FooterCompact, {
      inputs: { brand: 'Globex', owner: 'Globex Corp.' },
    });

    expect((fixture.nativeElement as HTMLElement).querySelector('footer')).not.toBeNull();
    expect(
      screen.getByText(new RegExp(`© ${new Date().getFullYear()} Globex Corp\\.`))
    ).toBeTruthy();
  });

  it('renders configured links in separately named navigations', async () => {
    await render(FooterCompact, {
      inputs: {
        links: [{ label: 'Status', href: '/status' }],
        social: [{ label: 'Bluesky', href: 'https://bsky.app/' }],
      },
    });

    expect(screen.getByRole('navigation', { name: 'Footer' })).toContainElement(
      screen.getByRole('link', { name: 'Status' })
    );
    expect(screen.getByRole('navigation', { name: 'Social' })).toContainElement(
      screen.getByRole('link', { name: 'Bluesky' })
    );
    expect(screen.getByRole('link', { name: 'Bluesky' })).toHaveAttribute('rel', 'noopener');
  });

  it('drops empty navigations and has no form controls', async () => {
    const { fixture } = await render(FooterCompact, { inputs: { links: [], social: [] } });

    expect(screen.queryByRole('navigation')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('input, form, button')).toBeNull();
  });
});
