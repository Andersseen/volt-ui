import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { AuthLogin } from './auth-login';

describe('AuthLogin', () => {
  it('binds every field through volt-form-field, same as the layout it is the shipped version of', async () => {
    await render(AuthLogin);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('wires the hint into the control rather than just placing it underneath', async () => {
    await render(AuthLogin);

    const password = screen.getByLabelText('Password');
    const describedBy = password.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent(/at least 8 characters/i);
  });

  it('labels the remember checkbox through a bound id', async () => {
    await render(AuthLogin);

    // A static id would also land on <volt-checkbox>, and `for` would resolve to the
    // custom element instead of the control.
    expect(screen.getByRole('checkbox', { name: /keep me signed in/i })).toBeInTheDocument();
  });

  it('never shows the brand mark twice', async () => {
    const { fixture } = await render(AuthLogin);
    const host = fixture.nativeElement as HTMLElement;

    // One mark lives in the brand panel and one in the form column; the container query
    // shows exactly one of them, so they must not both be unconditional.
    const marks = host.querySelectorAll('lmn-zap');
    expect(marks).toHaveLength(2);
    expect(host.querySelector('.brand')?.className).toContain('hidden');
  });

  it('declares a container, so it answers to its own width and not the window', async () => {
    const { fixture } = await render(AuthLogin);
    const section = (fixture.nativeElement as HTMLElement).querySelector('section');

    expect(section?.className).toContain('@container');
  });
});
