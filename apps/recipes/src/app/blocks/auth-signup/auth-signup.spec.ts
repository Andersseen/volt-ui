import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AuthSignup, passwordScore } from './auth-signup';

describe('passwordScore', () => {
  it('rises with length and variety', () => {
    expect(passwordScore('short')).toBe(0);
    expect(passwordScore('lowercase')).toBe(1);
    expect(passwordScore('Lowercase1')).toBe(2);
    expect(passwordScore('Lowercase1!xyz')).toBe(4);
  });
});

describe('AuthSignup', () => {
  it('says nothing is wrong until the first submit, then names each problem', async () => {
    const user = userEvent.setup();
    await render(AuthSignup);

    expect(screen.queryByText('Tell us what to call you.')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByText('Tell us what to call you.')).toBeInTheDocument();
    expect(screen.getByText('Accept the terms to continue.')).toBeInTheDocument();
  });

  it('reports strength as a meter with a word, not only a colour', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(AuthSignup);
    const password = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[autocomplete="new-password"]'
    )!;

    await user.type(password, 'Lowercase1!xyz');

    const meter = screen.getByRole('meter', { name: 'Password strength' });
    expect(meter).toHaveAttribute('aria-valuenow', '4');
    expect(meter).toHaveAttribute('aria-valuetext', 'Strong');
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('shows the password through a pressed toggle', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(AuthSignup);
    const toggle = screen.getByRole('button', { name: 'Show password' });
    const password = () =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
        'input[autocomplete="new-password"]'
      )!;

    expect(password().type).toBe('password');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(password().type).toBe('text');
  });
});
