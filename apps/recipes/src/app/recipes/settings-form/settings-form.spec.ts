import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { SettingsFormRecipe, type SaveSettings, type Settings } from './settings-form';

/** A save the test settles by hand, so "pending" is a state it can stand in. */
function controllable() {
  const calls: { value: Settings; resolve: () => void; reject: (e: Error) => void }[] = [];
  const save: SaveSettings = value =>
    new Promise((resolve, reject) => calls.push({ value, resolve: () => resolve(value), reject }));
  return { save: vi.fn(save), calls };
}

async function setup() {
  const control = controllable();
  const view = await render(SettingsFormRecipe, { inputs: { save: control.save } });
  const user = userEvent.setup();
  const name = screen.getByRole('textbox', { name: 'Name' });
  const email = screen.getByRole('textbox', { name: 'Email' });
  const saveButton = () => screen.getByRole('button', { name: /Save changes|Saving/ });
  return { ...control, ...view, user, name, email, saveButton };
}

describe('Settings form recipe', () => {
  it('starts clean: nothing to save or cancel', async () => {
    const { saveButton, fixture } = await setup();

    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(fixture.nativeElement).toHaveAttribute('data-state', 'clean');
  });

  it('is dirty only while the values differ from the saved ones', async () => {
    const { user, name, fixture, saveButton } = await setup();
    const state = () => (fixture.nativeElement as HTMLElement).getAttribute('data-state');

    await user.type(name, 'x');
    expect(state()).toBe('dirty');
    expect(saveButton()).not.toHaveAttribute('aria-disabled');

    await user.type(name, '{Backspace}');
    expect(state()).toBe('clean');
  });

  it('shows every error and focuses the first invalid control on an invalid submit', async () => {
    const { user, name, email, save, saveButton } = await setup();

    await user.clear(name);
    await user.clear(email);
    await user.type(email, 'not-an-email');
    await user.click(saveButton());

    expect(await screen.findByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    await waitFor(() => expect(name).toHaveFocus());
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/valid email/);
    expect(save).not.toHaveBeenCalled();
  });

  it('starts exactly one request, keeps focus on Save while pending, then confirms', async () => {
    const { user, name, save, calls, saveButton } = await setup();
    await user.type(name, ' Jr');

    await user.click(saveButton());
    // Double submit: another click and the Enter key must both be ignored.
    await user.click(saveButton());
    saveButton().focus();
    await user.keyboard('{Enter}');

    expect(save).toHaveBeenCalledTimes(1);
    expect(saveButton()).toHaveTextContent('Saving…');
    expect(saveButton()).toHaveFocus();

    calls[0].resolve();
    expect(await screen.findByText('Settings saved')).toBeInTheDocument();
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true'); // clean again
    expect(name).toHaveValue('Marta Ibáñez Jr');
  });

  it('keeps the edits after a failure and retries successfully', async () => {
    const { user, name, calls, save, saveButton } = await setup();
    await user.type(name, ' Jr');

    await user.click(saveButton());
    calls[0].reject(new Error('The server could not be reached.'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The server could not be reached.');
    expect(alert).toHaveTextContent('Your changes are still here');
    expect(name).toHaveValue('Marta Ibáñez Jr');
    expect(saveButton()).not.toHaveAttribute('aria-disabled');

    await user.click(saveButton());
    expect(save).toHaveBeenCalledTimes(2);
    calls[1].resolve();
    expect(await screen.findByText('Settings saved')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('cancel restores the last saved values, not the first ones', async () => {
    const { user, name, calls, saveButton } = await setup();

    await user.type(name, ' Jr');
    await user.click(saveButton());
    calls[0].resolve();
    await screen.findByText('Settings saved');

    await user.type(name, ' III');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(name).toHaveValue('Marta Ibáñez Jr');
    expect(screen.queryByText('Settings saved')).toBeNull();
  });

  it('announces success through a live region that exists before the message', async () => {
    const { container } = await setup();

    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});
