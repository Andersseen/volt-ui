import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HeroWaitlist } from './hero-waitlist';

describe('HeroWaitlist', () => {
  it('does not complain while typing, only after a submit', async () => {
    const user = userEvent.setup();
    await render(HeroWaitlist);
    const email = screen.getByRole('textbox', { name: 'Work email' });

    await user.type(email, 'not-an-address');
    expect(email).not.toHaveAttribute('aria-invalid');

    await user.click(screen.getByRole('button', { name: /join the waitlist/i }));
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/enter an address like/i)).toBeInTheDocument();
  });

  it('confirms a valid address in the status region and moves focus to it', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HeroWaitlist);

    await user.type(screen.getByRole('textbox', { name: 'Work email' }), ' ada@example.com ');
    await user.click(screen.getByRole('button', { name: /join the waitlist/i }));
    await fixture.whenStable();

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('You are on the list.');
    expect(status).toHaveTextContent('ada@example.com');
    expect(status).toContainElement(document.activeElement as HTMLElement);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('2,419')).toBeInTheDocument();
  });
});
