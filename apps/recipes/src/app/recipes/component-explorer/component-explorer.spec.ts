import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ComponentExplorer } from './component-explorer';

const usage = () => screen.getByLabelText('Usage code').textContent!;

describe('ComponentExplorer', () => {
  it('starts on the default button, with the shortest code that produces it', async () => {
    await render(ComponentExplorer);

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    expect(usage()).toBe('<volt-button>Save changes</volt-button>');
  });

  it('changes the variant in the preview and the code', async () => {
    await render(ComponentExplorer);

    await userEvent.click(screen.getByRole('radio', { name: 'destructive' }));

    expect(usage()).toContain('variant="destructive"');
    expect(document.querySelector('volt-button button')).toHaveAttribute(
      'data-variant',
      'destructive'
    );
  });

  it('shows the button states as behaviour, not just as a style', async () => {
    await render(ComponentExplorer);
    const press = screen.getByRole('button', { name: 'Save changes' });
    await userEvent.click(press);
    expect(screen.getByText('Pressed 1 time')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'disabled' }));
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(usage()).toContain('disabled');

    await userEvent.click(screen.getByRole('radio', { name: 'loading' }));
    expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled();
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(usage()).toContain('<volt-spinner');
  });

  it('switches component and keeps each one’s own selection', async () => {
    await render(ComponentExplorer);
    await userEvent.click(screen.getByRole('radio', { name: 'outline' }));

    await userEvent.click(screen.getByRole('radio', { name: 'Badge' }));
    expect(usage()).toBe('<volt-badge>New release</volt-badge>');
    expect(screen.queryByRole('group', { name: 'State' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'success' }));
    expect(usage()).toContain('variant="success"');

    await userEvent.click(screen.getByRole('radio', { name: 'Button' }));
    expect(usage()).toContain('variant="outline"');
  });

  it('lets the switch be toggled and disabled, and reports both in the code', async () => {
    await render(ComponentExplorer);
    await userEvent.click(screen.getByRole('radio', { name: 'Switch' }));

    await userEvent.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(screen.getByText('Notifications on')).toBeInTheDocument();
    expect(usage()).toContain('[checked]="true"');

    await userEvent.click(screen.getByRole('radio', { name: 'disabled' }));
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeDisabled();
    expect(usage()).toContain('disabled');
  });

  it('copies exactly the code on screen', async () => {
    const user = userEvent.setup();
    await render(ComponentExplorer);
    await user.click(screen.getByRole('radio', { name: 'ghost' }));

    await user.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(await navigator.clipboard.readText()).toBe(usage());
  });
});
