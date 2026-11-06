import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NavbarMarketing } from './navbar-marketing';

const links = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
];

describe('NavbarMarketing', () => {
  it('renders the configured brand, links and call to action', async () => {
    await render(NavbarMarketing, {
      inputs: { brand: 'Globex', links, cta: { label: 'Start free', href: '/signup' } },
    });

    expect(screen.getByRole('link', { name: 'Globex' })).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: 'Pricing' })[0]).toHaveAttribute('href', '/pricing');
    expect(screen.getByRole('link', { name: 'Start free' })).toHaveAttribute('href', '/signup');
  });

  it('marks only the current link', async () => {
    await render(NavbarMarketing, { inputs: { links, currentHref: '/pricing' } });

    const current = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('aria-current') === 'page');
    expect(current.map(link => link.textContent?.trim())).toEqual(['Pricing']);
  });

  it('omits the call to action when none is given', async () => {
    await render(NavbarMarketing, { inputs: { links, cta: null } });

    expect(screen.queryByRole('link', { name: 'Get started' })).toBeNull();
  });

  it('opens a disclosure menu, closes it on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    await render(NavbarMarketing, { inputs: { links } });
    const toggle = screen.getByRole('button', { name: 'Open menu' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(document.getElementById('navbar-marketing-menu')).not.toBeNull();

    await user.keyboard('{Tab}{Escape}');

    expect(document.getElementById('navbar-marketing-menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });

  it('emits the chosen link and closes the menu', async () => {
    const user = userEvent.setup();
    const chosen: string[] = [];
    await render(NavbarMarketing, {
      inputs: { links },
      on: { linkSelected: link => chosen.push(link.href) },
    });

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const mobile = document.getElementById('navbar-marketing-menu')!;
    mobile
      .querySelector<HTMLAnchorElement>('a[href="/features"]')!
      .addEventListener('click', event => event.preventDefault());
    await user.click(mobile.querySelector('a[href="/features"]')!);

    expect(chosen).toEqual(['/features']);
    expect(document.getElementById('navbar-marketing-menu')).toBeNull();
  });

  it('is sticky only when asked', async () => {
    const { fixture } = await render(NavbarMarketing, { inputs: { sticky: true } });
    expect(fixture.nativeElement.querySelector('header')).toHaveClass('sticky');
  });
});
