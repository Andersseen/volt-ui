import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ContactSplit } from './contact-split';

describe('ContactSplit', () => {
  it('labels every field', async () => {
    await render(ContactSplit);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Topic' })).toBeInTheDocument();
  });

  it('offers the ways of reaching you that are not the form', async () => {
    await render(ContactSplit);

    expect(screen.getByText('hello@example.com')).toBeInTheDocument();
    expect(screen.getByText('+34 900 000 000')).toBeInTheDocument();
  });

  it('swaps the form for a confirmation in place, without navigating', async () => {
    const { fixture } = await render(ContactSplit);
    const host = fixture.nativeElement as HTMLElement;

    const submitted = new Event('submit', { bubbles: true, cancelable: true });
    host.querySelector('form')!.dispatchEvent(submitted);
    await fixture.whenStable();

    expect(submitted.defaultPrevented).toBe(true);
    expect(host.querySelector('form')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(/message sent/i);
  });

  it('moves focus onto the confirmation so it is not lost on <body>', async () => {
    const { fixture } = await render(ContactSplit);
    const host = fixture.nativeElement as HTMLElement;

    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(screen.getByRole('status'));
  });

  it('can be reset to send another message', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ContactSplit);
    const host = fixture.nativeElement as HTMLElement;

    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    await user.click(screen.getByRole('button', { name: /send another/i }));

    expect(host.querySelector('form')).not.toBeNull();
  });
});
