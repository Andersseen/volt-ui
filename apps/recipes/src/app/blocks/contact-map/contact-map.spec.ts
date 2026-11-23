import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ContactMap } from './contact-map';
import { CONTACT_MAP } from './contact-map.data';

describe('ContactMap', () => {
  it('asks for the essentials and moves focus to the first missing one', async () => {
    const user = userEvent.setup();
    await render(ContactMap);

    await user.click(screen.getByRole('button', { name: /Send/ }));

    expect(screen.getByText('Tell us who to reply to.')).toBeInTheDocument();
    expect(screen.getByText('Enter an email address we can reply to.')).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByLabelText('Name'));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('confirms a complete message and clears the form', async () => {
    const user = userEvent.setup();
    await render(ContactMap);

    await user.type(screen.getByLabelText('Name'), 'Grace');
    await user.type(screen.getByLabelText('Email'), 'grace@example.com');
    await user.type(screen.getByLabelText('About the site'), 'A barn conversion by a river.');
    await user.click(screen.getByRole('button', { name: /Send/ }));

    expect(screen.getByRole('status')).toHaveTextContent('within two working days');
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('rejects an address that cannot be replied to', async () => {
    const user = userEvent.setup();
    await render(ContactMap);

    await user.type(screen.getByLabelText('Name'), 'Grace');
    await user.type(screen.getByLabelText('Email'), 'grace-at-example');
    await user.type(screen.getByLabelText('About the site'), 'A barn.');
    await user.click(screen.getByRole('button', { name: /Send/ }));

    expect(screen.getByText('Enter an email address we can reply to.')).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByLabelText('Email'));
  });

  it('describes the map as one image and draws it from the generated paths', async () => {
    const { fixture } = await render(ContactMap);
    const map = screen.getByRole('img', { name: /Switzerland highlighted/ });
    const paths = (fixture.nativeElement as HTMLElement).querySelectorAll('.map svg path');

    expect(map).toBeInTheDocument();
    expect(paths).toHaveLength(2);
    expect(paths[1].getAttribute('d')).toBe(CONTACT_MAP.highlight);
  });

  it('ships a map whose dots are zero-length segments, a few kilobytes in all', () => {
    const dots = (CONTACT_MAP.rest + CONTACT_MAP.highlight).match(/h0/g)?.length ?? 0;

    expect(dots).toBeGreaterThan(1000);
    expect(CONTACT_MAP.highlight).toMatch(/^(M[\d.]+ [\d.]+h0)+$/);
    expect(CONTACT_MAP.pin.x).toBeLessThan(CONTACT_MAP.width);
    expect(CONTACT_MAP.pin.y).toBeLessThan(CONTACT_MAP.height);
  });
});
