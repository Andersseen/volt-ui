import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NavbarApp } from './navbar-app';

const destinations = [
  { id: 'a', label: 'Alpha', href: '/alpha' },
  { id: 'b', label: 'Beta', href: '/beta' },
];

describe('NavbarApp', () => {
  it('shows the workspace, destinations and the current one', async () => {
    await render(NavbarApp, { inputs: { workspace: 'Initech', destinations, current: 'b' } });

    expect(screen.getByText('Initech')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beta' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Alpha' })).not.toHaveAttribute('aria-current');
  });

  it('reports account and destination interaction without handling it', async () => {
    const user = userEvent.setup();
    const picked: string[] = [];
    const account: string[] = [];
    await render(NavbarApp, {
      inputs: { destinations, account: { name: 'Grace Hopper' } },
      on: {
        destinationSelected: d => picked.push(d.id),
        accountAction: a => account.push(a),
      },
    });

    const alpha = screen.getByRole('link', { name: 'Alpha' });
    alpha.addEventListener('click', event => event.preventDefault());
    await user.click(alpha);
    await user.click(screen.getByRole('button', { name: 'Account: Grace Hopper' }));

    expect(picked).toEqual(['a']);
    expect(account).toEqual(['open']);
  });

  it('derives initials and renders no account area without an account', async () => {
    const { rerender } = await render(NavbarApp, {
      inputs: { account: { name: 'Grace Brewster Hopper' } },
    });
    expect(screen.getByText('GB')).toBeInTheDocument();

    await rerender({ inputs: { account: null } });
    expect(screen.queryByRole('button', { name: /^Account/ })).toBeNull();
  });

  it('collapses into a disclosure that Escape closes, returning focus to the toggle', async () => {
    const user = userEvent.setup();
    await render(NavbarApp, { inputs: { destinations } });

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(document.getElementById('navbar-app-menu')).not.toBeNull();

    await user.keyboard('{Escape}');

    expect(document.getElementById('navbar-app-menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveFocus();
  });

  it('offers sign out in the mobile panel as an event only', async () => {
    const user = userEvent.setup();
    const events: string[] = [];
    await render(NavbarApp, { on: { accountAction: a => events.push(a) } });

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(events).toEqual(['sign-out']);
  });
});
