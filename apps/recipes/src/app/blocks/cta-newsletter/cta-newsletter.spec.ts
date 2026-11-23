import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CtaNewsletter } from './cta-newsletter';

describe('CtaNewsletter', () => {
  it('has a visible label and describes the field with its hint', async () => {
    await render(CtaNewsletter);

    const email = screen.getByRole('textbox', { name: 'Email address' });
    expect(email).toHaveAccessibleDescription('Weekly. Unsubscribe with one click.');
  });

  it('swaps the hint for an error after an invalid submit', async () => {
    const user = userEvent.setup();
    await render(CtaNewsletter);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'nope');
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));

    const email = screen.getByRole('textbox', { name: 'Email address' });
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('That address is missing an @ or a domain.');
  });

  it('confirms in the status region and moves focus there', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(CtaNewsletter);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));
    await fixture.whenStable();

    expect(screen.getByRole('status')).toHaveTextContent('Check your inbox.');
    expect(screen.getByRole('status')).toContainElement(document.activeElement as HTMLElement);
  });
});
