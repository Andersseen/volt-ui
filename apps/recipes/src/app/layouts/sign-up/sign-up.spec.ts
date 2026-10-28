import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SignUpLayout } from './sign-up';

describe('SignUpLayout', () => {
  it('binds every label to its own control through volt-form-field', async () => {
    await render(SignUpLayout);

    // No hand-written ids: the primitive generates them and wires `for` itself.
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Work email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('keeps submit disabled until the terms are accepted', async () => {
    const user = userEvent.setup();
    await render(SignUpLayout);

    const submit = screen.getByRole('button', { name: /create account/i });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));

    expect(submit).toBeEnabled();
  });

  it('shows a hint until there is something to complain about, then the error', async () => {
    const user = userEvent.setup();
    await render(SignUpLayout);

    expect(screen.getByText(/we send one confirmation/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Work email'), 'not-an-email');

    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
    expect(screen.queryByText(/we send one confirmation/i)).not.toBeInTheDocument();
  });

  it('announces the error through a live region rather than colour alone', async () => {
    const user = userEvent.setup();
    await render(SignUpLayout);

    await user.type(screen.getByLabelText('Work email'), 'nope');

    const error = screen.getByRole('alert');
    expect(error).toHaveAttribute('aria-live', 'assertive');
  });

  it('wires the hint into the control, which is what volt-form-field is for', async () => {
    await render(SignUpLayout);

    const password = screen.getByLabelText('Password');
    const describedBy = password.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent(/at least 8 characters/i);
  });
});
